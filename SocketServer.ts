import * as http from 'http';
import * as Fs from 'fs';
import * as SocketIo from 'socket.io';
const app = http.createServer();
const io = SocketIo.listen(app);
app.listen(3000, () => console.log('server running'));

let clients = {};
let clientsSuccess: string[] = [];
function sort(io, username: string = '') {
  Object.keys(clients)
    .filter(key => key != username)
    .map(key =>
      io.sockets.connected[clients[key].socket].emit(key, 'run!' + key),
    );
}
function emitCountUsers(io, activeClients) {
  io.emit('count-users', Object.keys(activeClients).length);
}
io.sockets.on('connection', function(socket) {
  socket.on('add-user', function(data) {
    console.log('usuarioNovo!', data.username);
    clients[data.username] = {
      socket: socket.id,
    };
    emitCountUsers(io, clients);
  });

  socket.on('sort', function(data) {
    console.log('Sending:', data);
    sort(io);
  });
  socket.on('press', function(data) {
    console.log('Sending:', data.username);
    sort(io, data.username);
  });

  socket.on('disconnect', function(data) {
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
