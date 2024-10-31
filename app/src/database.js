import User from './models/User.js';
import Message from './models/Message.js';
import { Sequelize } from 'sequelize';
import path from 'path';

export default class Database {
    constructor() {
        this.sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: path.join("/app/bin", 'database.sqlite'),
        });

        this.userModel = User(this.sequelize);
        this.MessageModel = Message(this.sequelize);
    }

    async initialization() {
        try {
            await this.sequelize.authenticate();
            console.log('Соединение с БД установлено успешно.');
            await this.sequelize.sync();
            console.log('Модели синхронизированы с БД.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    }
}