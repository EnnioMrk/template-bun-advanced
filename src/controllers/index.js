/**
 * Controllers index - exports all controllers for easy importing
 * @module controllers
 */

import UserController from './UserController.js';

// Create singleton instances
const userController = new UserController();

export { userController };

export default {
    user: userController,
};
