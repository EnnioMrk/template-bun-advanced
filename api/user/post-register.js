import { userController } from '../../src/controllers/index.js';

export default async function register(req, res) {
    return await userController.register(req, res);
}
