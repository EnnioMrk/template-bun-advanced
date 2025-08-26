import config from '../config/index.js';
import logger from '../services/logger.js';

export default class AuthManager {
    constructor(app) {
        this.app = app;
        this.noAuthRoutes = config.auth.noAuthRoutes;
    }

    /**
     * Authentication middleware - require user login
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Next middleware function
     */
    requireAuth(req, res, next) {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        next();
    }

    /**
     * Check if path is a static file
     * @param {string} path - Request path
     * @returns {boolean} True if path is a static file
     */
    isStaticFile(path) {
        return config.auth.staticFileExtensions.some((ext) =>
            path.includes(ext)
        );
    }

    /**
     * Check if route requires authentication
     * @param {string} path - Request path
     * @returns {boolean} True if route requires authentication
     */
    requiresAuth(path) {
        return !this.noAuthRoutes.some(
            (route) => route === path || path.includes(route + '/')
        );
    }

    /**
     * Start authentication middleware
     */
    start() {
        // Apply authentication middleware to all routes except unprotected ones
        this.app.use((req, res, next) => {
            const path = req.path;

            // Allow access to API routes without authentication
            if (path.startsWith('/api')) {
                return next();
            }

            // Allow access to static assets without authentication
            if (this.isStaticFile(path)) {
                return next();
            }

            // Check authentication requirements
            if (!this.requiresAuth(path)) {
                return next();
            }

            return this.requireAuth(req, res, next);
        });
    }
}
