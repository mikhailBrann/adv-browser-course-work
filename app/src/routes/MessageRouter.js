import { Router } from 'express';
import MessageOrmHelper from '../classes/MessageOrmHelper.js';

const MessageRouter = Router();
const Message = new MessageOrmHelper();

MessageRouter.get('/', (req, res) => Message.initGetMethod(req, res));
MessageRouter.post('/', (req, res) => Message.initPostMethod(req, res));


export default MessageRouter;