/**
 * User Controller - handles user authentication and profile operations
 * @module controllers/UserController
 */

import { verifyUserPassword, getDb } from '../utils/db.js';
import logger from '../services/logger.js';

export default class UserController {
    async register(req, res) {
        try {
            const { email, firstName, lastName, password_hash } = req.body;
            logger.info(`User registration attempt: ${email}`);

            // Validate user data
            if (!email || !firstName || !lastName || !password_hash) {
                logger.warn(`Registration failed: Missing fields`);
                return res
                    .status(400)
                    .json({ error: 'All fields are required' });
            }

            // Check if user already exists
            const existingUser = await getDb().query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );

            if (existingUser.rows.length > 0) {
                logger.warn(`Registration failed: User already exists`);
                return res.status(409).json({ error: 'User already exists' });
            }

            // Create new user
            const newUser = await getDb().query(
                'INSERT INTO users (email, first_name, last_name, password_hash) VALUES ($1, $2, $3, $4) RETURNING *',
                [email, firstName, lastName, password_hash]
            );

            logger.success(`User registered successfully: ${email}`);
            res.status(201).json({ user: newUser.rows[0] });
        } catch (error) {
            logger.error('Error during registration', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * Handle user login
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;
            logger.info(`User login attempt: ${email}`);

            const user = await verifyUserPassword(email, password);

            if (user) {
                // Save user to session
                req.session.user = user;

                logger.success(`User ${email} logged in successfully`);
                res.json({ success: true, redirect: '/dashboard' });
            } else {
                logger.warn(`Failed login attempt for ${email}`);
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } catch (error) {
            logger.error('Error during login', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * Handle user logout
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async logout(req, res) {
        try {
            const email = req.session?.user?.email;
            if (email) {
                logger.info(`User logout: ${email}`);
            }

            req.session.destroy((err) => {
                if (err) {
                    logger.error('Error destroying session', err);
                    return res.status(500).json({ error: 'Failed to logout' });
                }
                res.json({ success: true, redirect: '/login' });
            });
        } catch (error) {
            logger.error('Error during logout', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * Get user information
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getUserInfo(req, res) {
        try {
            const email = req.session.user.email;
            const db = getDb();

            logger.info(`Getting user info for: ${email}`);

            const query = `
                SELECT email, first_name, last_name
                FROM users 
                WHERE email = $1
            `;
            const result = await db.query(query, [email]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found',
                });
            }

            const user = result.rows[0];
            res.json({
                success: true,
                user: {
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    plan: user.plan,
                    subscriptionStatus: user.subscription_status,
                },
            });
        } catch (error) {
            logger.error('Error getting user info', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get user information',
            });
        }
    }
}
