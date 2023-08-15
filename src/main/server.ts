import express from 'express';
import { createServer } from 'http';

import { join } from 'path';
import { Server } from 'socket.io';

process.parentPort.on('message', (e) => {
    const [port] = e.ports;
    console.log(e.data.message);
    process.parentPort.postMessage('what is this');
});

let app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });
httpServer.listen(9990);
console.log(join(__dirname + '../../resources'));
app.use('/', express.static(join(__dirname, '../../resources')));

app.get('/', function (req, res) {
    res.sendFile(join(__dirname, '../../resources/index.html'));
});
io.on('connection', (socket) => {
    onNewSocketConnection(socket);
});
function onNewSocketConnection(socket) {
    io.emit('onload', 'ur connected'); // This will emit the event to all connected sockets
    socket.on('disconnect', () => {
        console.log('user dc');
    });
    socket.on('whoiam', (msg) => {
        if (msg === 'sender') {
            io.to(socket.id).emit('whouare', `things look good and running`);
            socket.join('senders');
        } else {
            io.to(socket.id).emit('whouare', `things look good and running`);
            socket.join('recievers');
        }
    });
    socket.on('ask4update', (msg) => {
        if (msg === 'pls') {
            socket.to('senders').emit('ask4update', msg);
        }
    });
    socket.on('update', (msg) => {
        socket.to('recievers').emit('update', msg);
    });
}
