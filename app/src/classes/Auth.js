import express from "express";
import { Router } from 'express';
import FileWorker from "./FileWorker.js";
import cors from 'cors';

export default class Auth {
    constructor() {
        this.app = express();

        //корс заглушка
        this.app.use(cors());
        //отключение кеширования
        this.app.enable('view cache');
        this.app.set('view cache', false);
        this.app.use(express.json());
        
        this.file = new FileWorker('users.json');

        //add rout init
        this.app.post('/auth', (req, res) => this.checkAuth(req, res));
    }

    async checkAuth(req, res) {
        if(!req.body.nickname) {
            return res.send({'status': 'false', 'message': 'Укажите никнейм'});
        }

        const nickname = req.body.nickname;
        const users = await this.file.readFile();
        const usersObj = JSON.parse(users);

        if(usersObj.users.find(user => user.nickname === nickname)) {
            return res.send({'status': 'false', 'message': 'Пользователь с таким никнеймом уже существует'});
        }

        //записываем пользователя в файл
        usersObj.users.push({nickname: nickname});
        await this.file.writeFile(JSON.stringify(usersObj));

        return res.send({'status': 'true', 'nickname': nickname});
    }
}