import { Router } from 'express';
import UserOrmHelper from '../classes/UserOrmHelper.js';

const UserRouter = Router();
const User = new UserOrmHelper();

UserRouter.get('/', (req, res) => User.initGetMethod(req, res));
UserRouter.post('/', (req, res) => User.initPostMethod(req, res));

export default UserRouter;