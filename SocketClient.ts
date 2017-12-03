import * as WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:5000');

ws.on('open', function open() {
  setInterval(() => {
    console.log('sending message..');
    ws.send('ae');
    ws.emit('meyEven', `Event: ${new Date().toISOString()}`);
  }, 1000);
});
