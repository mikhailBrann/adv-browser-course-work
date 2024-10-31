
import { WebSocketServer } from "ws";
import http from 'http';
import Auth from './Auth.js';
import FileWorker from "./FileWorker.js";

const port = process.env.PORT || 8787;

export default class Chat {
    constructor() {
        //создаем сервер
        const auth = new Auth();        
        const server = http.createServer(auth.app);

        this.wss = new WebSocketServer({ server });

        //add events
        this.wss.on('connection', this._connection.bind(this));
        server.listen(port, () => {
            console.log(`Server started on port ${port}...`);
        });
    }

    async _reinit(wws) {
      const userFile = new FileWorker('users.json');
      const users = userFile.readFile();

      users.then(usersData => {
        wws.clients.forEach(function each(client) {
          client.send(usersData);
        });
      });
    }

    async _connection(ws) {
        
        // отправка приветственного сообщения клиенту
        const mainObj = this;
        const wws = mainObj.wss;
        
        //инициализируем список пользователей
        mainObj._reinit(wws);
        
        ws.on('message', async function(message) {
          const data = JSON.parse(message);
          const userFile = new FileWorker('users.json');
          const users = await userFile.readFile();
          const usersObj = JSON.parse(users);
          
          switch (data.eventType) {
            case 'userLeave':
              // отправка сообщения всем клиентам
              const { nickname } = data;
              const newUserList = usersObj.users.filter(user => user.nickname !== nickname);

              usersObj.users = newUserList;
              await userFile.writeFile(JSON.stringify(usersObj));
              break;
            case 'addedMessage':
              const { message } = data;
              usersObj.messages.push(message);
              await userFile.writeFile(JSON.stringify(usersObj));
              break;
            default:
              break;
          }

          mainObj._reinit(wws);
        });
    }
}
