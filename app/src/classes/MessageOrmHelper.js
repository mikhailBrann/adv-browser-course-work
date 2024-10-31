import Database from "../database.js";
import FileWorker from "./FileWorker.js";

export default class MessageOrmHelper {
    constructor() {
        //init database
        this.database = new Database();
        this.database.initialization();
    }

    initGetMethod(req, res) {
        const params = req.query;
        const userId = params.userId ?? false;

        if(!params.method) {
            return this._exeptionHandler(res, 404, 'Method not found');
        }

        if(!userId) {
            return this._exeptionHandler(res, 404, 'userId is not found');
        }

        switch(params.method) {
            case 'getList':
                this._callbackRequest(async () => {
                    const paramsRequest = {
                        limit: 10,
                        order: [['id', 'DESC']],
                        where: {
                            userId: userId
                        }
                    }

                    if(params.limit) {
                        paramsRequest.limit = params.limit;
                    }

                    if(params.offset) {
                        paramsRequest.offset = params.offset;
                    }

                    if(params.type) {
                        paramsRequest.where.type = params.type;
                    }

                    // проверяем есть ли еще сообщения для отрисовки
                    if(params.renderQuantity) {
                        const totalCount = await this.database.sequelize.models.Message.count({where: {
                            userId: userId
                        }});

                        if(params.renderQuantity >= totalCount) {
                            return res.status(200).json({
                                status: 'full',
                                count: totalCount,
                                data: []
                            });
                        }
                    }

                    const messageList = await this.database.sequelize.models.Message.findAll(paramsRequest);

                    return res.status(200).json({
                        status: 'success',
                        data: messageList
                    });
                });
                break;
            default:
                res.status(404).send('method is not exist!');
                break;
        }
    }

    initPostMethod(req, res) {
        const params = req.query;
        const reqestBody = req.body;
        const userId = params.userId ?? false;

        if(!params.method) {
            return this._exeptionHandler(res, 404, 'Method not found');
        }

        if(!userId) {
            return this._exeptionHandler(res, 404, 'userId is not found');
        }

        // id: {
        //     type: DataTypes.INTEGER,
        //     primaryKey: true,
        //     autoIncrement: true
        // },
        // value: {
        //     type: DataTypes.STRING,
        //     allowNull: false
        // },
        // type: {
        //     type: DataTypes.STRING,
        //     allowNull: false,
        //     defaultValue: 'text',
        //     validate: {
        //         isIn: [['text', 'file', 'audio', 'video', 'image', 'link']]
        //     }
        // },
        // created: {
        //     type: DataTypes.DATE,
        //     defaultValue: DataTypes.NOW
        // }

        switch(params.method) {
            case 'addedMessage':
                this._callbackRequest(async () => {
                    /**
                     * message
                     * userId
                     */
                    if(!reqestBody.message) {
                        return this._exeptionHandler(res, 400, 'message is empty!');
                    }

                    const data = {
                        value: reqestBody.message,
                        type: reqestBody.type ?? 'text',
                        userId: userId
                    };

                    const newMessage = this.database.sequelize.models.Message.create(data);

                    if(!newMessage) {
                        return this._exeptionHandler(res, 500, 'Message not created!');
                    } else {
                        return res.status(200).json({
                            status: 'success',
                            message: `Message created successfully`
                        });
                    }
                });
                break;
            case 'addedFile':
                this._callbackRequest(async () => {
                    const userId = params.userId ?? false;

                    if(!userId) {
                        return this._exeptionHandler(res, 404, 'userId is not found');
                    }
                    try {
                        

                        const base64File = reqestBody.data.split(',')[1];
                        const buffer = Buffer.from(base64File, 'base64');
                        const fileType = FileWorker.getTypeFile(reqestBody.name);
                        const fileName = Date.now() + '__' + reqestBody.name.split(/\s+/).join('_');
                        const filePathArr = ['uploads', userId, fileType];
                        const writeFile = FileWorker.writeFile(buffer, filePathArr, fileName);
                        
                        writeFile.then((path) => {
                            const data = {
                                value: path,
                                type: fileType,
                                userId: userId,
                                name: fileName
                            };

                            const newMessage = this.database.sequelize.models.Message.create(data);

                            if(!newMessage) {
                                return this._exeptionHandler(res, 500, 'Message not created!');
                            } else {
                                return res.status(200).json({
                                    status: 'success',
                                    message: `File created successfully`
                                });
                            }
                        });
            
                    } catch (error) {
                        return this._exeptionHandler(res, 500, error.message);
                    }
                });
                break;
            default:
                this._exeptionHandler(res, 400, 'method is not exist!');
                break;
        }
    }

    async _callbackRequest(callback) {
        return await callback();
    }

    _exeptionHandler(res, statusCode, errMessage) {
        return res.status(statusCode).json({
            status: 'error',
            message: errMessage
        });
    }
}