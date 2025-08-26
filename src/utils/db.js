/**
 * Database helper module for PostgreSQL operations
 * @module helpers/db
 */
import pg from 'pg';
// Remove bcryptjs import and use Bun's built-in password hashing

const { Pool } = pg;

/**
 * PostgreSQL connection pool
 * @type {pg.Pool}
 */
let pool;
let isConnecting = false;

async function testConnection(client) {
    try {
        await client.query('SELECT 1');
        return true;
    } catch (err) {
        console.error('❌ Connection test failed:', err);
        return false;
    }
}

async function connectDb() {
    if (isConnecting) {
        console.log('🔄 Connection attempt already in progress...');
        return;
    }

    isConnecting = true;

    try {
        if (pool) {
            try {
                const client = await pool.connect();
                const isConnected = await testConnection(client);
                client.release();

                if (isConnected) {
                    console.log('✅ Database connection is healthy');
                    isConnecting = false;
                    return;
                }
            } catch (err) {
                console.log(
                    '🔄 Existing pool is unhealthy, creating new connection...'
                );
            }
        }

        pool = new Pool({
            user: process.env.PG_USER,
            password: process.env.PG_PASSWORD,
            host: process.env.PG_HOST,
            database: process.env.PG_DB,
            ssl: true,
            min: 1,
            max: 10,
            createTimeoutMillis: 8000,
            acquireTimeoutMillis: 8000,
            idleTimeoutMillis: 1000 * 60 * 5,
            reapIntervalMillis: 1000,
            createRetryIntervalMillis: 100,
        });

        // Test the new connection
        const client = await pool.connect();
        const isConnected = await testConnection(client);
        client.release();

        if (!isConnected) {
            throw new Error('Failed to establish database connection');
        }

        pool.on('error', async (err) => {
            console.error('❌ Pool error:', err);
            if (!isConnecting) {
                console.log('🔄 Attempting to reconnect to database...');
                await connectDb();
            }
        });

        console.log('💾 Connected to database');
    } catch (err) {
        console.error('❌ Database connection error:', err);
        // Wait before retrying
        setTimeout(() => {
            isConnecting = false;
            connectDb();
        }, 5000);
    } finally {
        isConnecting = false;
    }
}

// Initial connection
connectDb();

/**
 * Returns the PostgreSQL client pool
 * @returns {pg.Pool} The PostgreSQL client pool
 */
export function getDb() {
    return pool;
}

/**
 * Adds a new user to the database with Untis data
 * @async
 * @param {string} email - User's email address
 * @param {string} passwordHash - User's hashed password
 * @returns {Promise<Object>} Result of the database operation
 */
export async function addUser(email, passwordHash) {
    const query = `
        INSERT INTO users (email, password_hash) 
        VALUES ($1, $2)
        RETURNING id
    `;
    const values = [email, passwordHash];
    const result = await pool.query(query, values);
    return result.rows[0];
}

/**
 * Creates a new user with subscription information
 * @async
 * @param {Object} userData - User data including email, password, plan details and subscription info
 * @returns {Promise<Object>} The created user object
 */
export async function saveNewUser(userData) {
    const { email, firstName, lastName, password } = userData;

    // Hash the password using Bun's built-in password hashing
    const passwordHash = await Bun.password.hash(password);

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Insert the new user
        const insertQuery = `
            INSERT INTO users (
                email, 
                password_hash, 
                first_name, 
                last_name, 
                created_at
            ) 
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            RETURNING id, email, first_name, last_name
        `;

        const values = [email, passwordHash, firstName, lastName];

        const result = await client.query(insertQuery, values);
        await client.query('COMMIT');

        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error saving new user:', error);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Verify a user's password
 * @async
 * @param {string} email - The user's email address
 * @param {string} password - The password to verify
 * @returns {Promise<Object|null>} The user object if password is correct, null otherwise
 */
export async function verifyUserPassword(email, password) {
    try {
        // Get user from database
        const query = `
            SELECT id, email, password_hash
            FROM users 
            WHERE email = $1
        `;
        const result = await pool.query(query, [email]);

        // If no user found, return null
        if (result.rows.length === 0) {
            return null;
        }

        const user = result.rows[0];
        const passwordHash = user.password_hash;

        // Verify password using Bun's password verification
        const isValid = await Bun.password.verify(password, passwordHash);

        if (isValid) {
            // Don't return the password hash to the calling function
            delete user.password_hash;
            return user;
        } else {
            return null;
        }
    } catch (error) {
        console.error('🔒 Error verifying user password:', error);
        throw error;
    }
}

/**
 * Initialize the database by creating required tables if they don't exist
 * @async
 * @returns {Promise<void>}
 */
export async function initializeDb() {
    const client = await pool.connect();
    try {
        // Create the table with email instead of username
        await client.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    first_name VARCHAR(255),
                    last_name VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

        console.log('✅ Users tables created/verified');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error initializing database:', err);
        throw err;
    } finally {
        client.release();
    }
}

// Initialize the database when this module is first loaded
initializeDb();
