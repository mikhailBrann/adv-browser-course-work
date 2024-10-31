import { Router } from 'express';
import TicketWorker from '../classes/TicketWorker.js';

const TiketRouter = Router();
const Ticket = new TicketWorker();

TiketRouter.get('/', (req, res) => Ticket.getRouteControl(req, res));
TiketRouter.post('/', (req, res) => Ticket.postRouteControl(req, res));


export default TiketRouter;