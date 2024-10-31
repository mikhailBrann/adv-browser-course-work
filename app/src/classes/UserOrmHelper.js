import Database from "../database.js";
import BcryptPass from "./BcryptPass.js";

export default class UserOrmHelper {
    constructor() {
        //init database
        this.database = new Database();
        this.database.initialization();
    }

    initGetMethod(req, res) {
        const params = req.query;
        const reqestBody = req.body;

        if(!params.method) {
            return this._exeptionHandler(res, 404, 'Method not found');
        }

        switch(params.method) {
            case 'all':
                break;
            default:
                res.status(404).send('method is not exist!');
                break;
        }
    }

    initPostMethod(req, res) {
        const params = req.query;
        const reqestBody = req.body;

        if(!params.method) {
            return this._exeptionHandler(res, 404, 'Method not found');
        }

        switch(params.method) {
            case 'register':
                this._callbackRequest(async () => {
                    /**
                     * login
                     * email
                     * password
                     */
                    if(!reqestBody.login) {
                        return this._exeptionHandler(res, 400, 'login is empty!');
                    }

                    const loginCheck = await this._userIsExist('login', reqestBody.login);

                    if(loginCheck !== null) {
                        return this._exeptionHandler(res, 409, `User with login ${reqestBody.login} already exist!`);
                    }

                    if(!reqestBody.email) {
                        return this._exeptionHandler(res, 400, 'email is empty!');
                    }

                    const emailCheck = await this._userIsExist('email', reqestBody.email);

                    if(emailCheck !== null) {
                        return this._exeptionHandler(res, 409, `User with email ${reqestBody.email} already exist!`);
                    }

                    if(!reqestBody.password) {
                        return this._exeptionHandler(res, 400, 'password is empty!');
                    }
                    
                    const { login, email, password } = reqestBody;
                    const hashedPassword = await BcryptPass.hashPassword(password);
                    const newUser = this.database.sequelize.models.User.create({
                        login,
                        email,
                        password: hashedPassword
                    });

                    if(!newUser) {
                        return this._exeptionHandler(res, 500, 'User not created!');
                    } else {
                        return res.status(200).json({
                            status: 'success',
                            message: `User ${reqestBody.login} created successfully`,
                            data: newUser
                        });
                    }
                });
                break;
            case 'auth':
                this._callbackRequest(async () => {
                    /**
                     * login
                     * password
                     */
                    if(!reqestBody.login) {
                        return this._exeptionHandler(res, 400, 'login is empty!');
                    }

                    const userCheck = await this._userIsExist('login', reqestBody.login);

                    if(userCheck === null) {
                        return this._exeptionHandler(res, 409, `User with login ${reqestBody.login} not exist!`);
                    }

                    if(!reqestBody.password) {
                        return this._exeptionHandler(res, 400, 'password is empty!');
                    }

                    const checkPassword = await BcryptPass.checkPassword(reqestBody.password, userCheck.password);

                    if(!checkPassword) {
                        return this._exeptionHandler(res, 401, 'Password is not correct!');
                    }

                    return res.status(200).json({
                        status: 'success',
                        data: {
                            id: userCheck.id,
                            login: userCheck.login,
                            email: userCheck.email
                        }
                    });
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

    async _userIsExist(key, value) {
        const response = await this.database.sequelize.models.User.findOne({
            where: {
                [key]: value
            }
        });

        return response;
    }
}