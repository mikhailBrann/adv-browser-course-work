import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { join } from 'path';
import UserRouter from './src/routes/UserRouter.js';
import MessageRouter from './src/routes/MessageRouter.js';

const port = process.env.PORT || 8787;

const app = express();
const upload = multer();

//отключение кеширования
app.enable('view cache');
app.set('view cache', false);

//разрешение cors
app.use(cors());
//парсинг тела запроса
app.use(express.json({limit: '500mb'}));  // For parsing JSON payloads
app.use(upload.none());
app.use(express.urlencoded({ limit: '500mb', extended: true }));

const uploadsPath = join('uploads');
app.use('/uploads', express.static(uploadsPath));
app.use('/user', UserRouter);
app.use('/message', MessageRouter);
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});