import * as http from 'http';
import * as Fs from 'fs';
import * as SocketIo from 'socket.io';
import { setInterval } from 'timers';
const app = http.createServer();
const io = SocketIo.listen(app);
app.listen(3000, () => console.log('server running'));
/*
 1 - Play
 2 - Sort
  - Navegar em todos os usuarios e sortear
  - Emitir um evento
  - Registrar data de expiração
  - Disparar SetTimeOut(3000)
    - HasLoser -> clearList
    - emit
*/
let clients: any = {};
let sortedClients = {};
let expirationDateSystem: Date = new Date();

let responseClients: string[] = [];
function sort(io) {
  const sortLength =
    Object.keys(clients).length - Object.keys(sortedClients).length;

  const sortNumber = Math.floor(Math.random() * sortLength);
  const itens = Object.keys(sortedClients);
  let sortedItem = Object.keys(clients).filter(activeClient => {
    return itens.indexOf(activeClient) == -1;
  });

  let sortedKey: string =
    sortedItem.length == 1 ? sortedItem[0] : sortedItem[sortNumber] || '';
  if (!sortedKey) {
    //novo sort
    const sortNumber = Math.floor(Math.random() * Object.keys(clients).length);
    sortedKey = <string>Object.keys(clients)[sortNumber];
    sortedClients = {};
    responseClients = [];
  }

  const sortedClient = clients[sortedKey];
  const expirationDate = new Date();
  expirationDate.setSeconds(expirationDate.getSeconds() + 2);
  expirationDate.setMilliseconds(0);

  sortedClients[sortedKey] = { ...sortedClient, expirationDate };
  clients[sortedKey] = sortedClients[sortedKey];
  const socketClient = io.sockets.connected[sortedClient.socket];
  socketClient.emit(sortedKey, 'sorted!' + new Date().toISOString());
  runAgain(sortedKey);
  function runAgain(sortedKey) {
    new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(1);
      }, 3000);
    }).then(_ => {
      console.log(`comparando se o ${sortedKey} já respondeu, para resortear`);
      if (responseClients.indexOf(sortedKey) !== -1) return;
      socketClient.emit(sortedKey, 'HASFAIL');
      responseClients = [];
      sortedClients = {};
    });
  }
}
function emitCountUsers(io, activeClients) {
  io.emit('count-users', Object.keys(activeClients).length);
}

io.sockets.on('connection', socket => {
  socket.on('add-user', data => {
    console.log('new user!', data.username);
    clients[data.username] = {
      socket: socket.id,
    };
    emitCountUsers(io, clients);
  });

  socket.on('sort', () => {
    expirationDateSystem = new Date();
    expirationDateSystem.setMinutes(expirationDateSystem.getMinutes() + 1);

    sort(io);
  });

  socket.on('press', data => {
    const username = data.username;
    console.log('Sending:', data.username);
    const expirationDate = <Date>new Date(data.sendDate);
    console.log('date', expirationDate);
    expirationDate.setMilliseconds(0);

    const sortedUser = clients[username];
    const socketClient = io.sockets.connected[sortedUser.socket];
    if (expirationDateSystem < new Date()) {
      socketClient.emit(username, 'ENDGAME');
    }
    responseClients.push(username);
    if (sortedUser.expirationDate < expirationDate) {
      //HASFAIL
      console.log('HASFAIL', sortedUser);
      socketClient.emit(username, 'HASFAIL');
      return;
    }
    sort(io);
  });

  socket.on('disconnect', data => {
    for (var name in clients) {
      if (clients[name].socket === socket.id) {
        console.log('disconnected:', name);
        delete clients[name];
        break;
      }
    }

    emitCountUsers(io, clients);
  });
});
