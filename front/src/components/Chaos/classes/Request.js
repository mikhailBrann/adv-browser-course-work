// process.env.PORT
// process.env.PROD_SERVER
// process.env.PROD_PROTOCOL
const wsPort = process.env.PORT || 6868;
const serverUrl = process.env.PROD_SERVER || '://adv-browser-js-hw-8-backend.onrender.com';
const serverProtocol = process.env.PROD_PROTOCOL || 'https';

export default class Request {
    constructor() {
        this.url = serverUrl;
        this.backendUrl = `${serverProtocol}${serverUrl}:${wsPort}`;
    }

    async send(body=false, method='GET',  url='', contentType='application/json', protocol=serverProtocol) {
        const requestParams = this._paramConstructor(url, method, body, protocol, contentType);
        return await fetch(requestParams.url, requestParams.params);
    }

    _paramConstructor(uri='', method='GET', body=false, protocol=serverProtocol, contentType='application/json') {
        return {
            url: `${protocol}${this.url}:${wsPort}${uri}`,
            params: {
                headers: {
                    'Content-Type': contentType,
                    'Access-Control-Allow-Origin': '*',
                },
                method,
                body: body ? body : null
            }
        }
    }
}