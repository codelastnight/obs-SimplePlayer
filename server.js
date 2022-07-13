const express = require('express');
const path = require('path');

let app = express();

let server = app.listen(9990);
var io = require('socket.io')(server);

app.get('/', function (req, res) {

    res.sendFile(path.join(__dirname, '/serve.html'));

});
io.on('connection', (socket) => {
    onNewSocketConnection(socket)
});
function onNewSocketConnection(socket) {
    io.emit('onload', "ur connected"); // This will emit the event to all connected sockets
    socket.on('disconnect', () => {
        console.log('user dc');


    });
    socket.on('whoiam', (msg) => {
        if (msg === 'sender') {
            io.to(socket.id).emit('whouare', `things look good and running`);
            socket.join("senders");

        } else {
            io.to(socket.id).emit('whouare', `things look good and running`);
            socket.join("recievers");
        }

    });
    socket.on('ask4update', (msg) => {
        if (msg === 'pls') {
            socket.to('senders').emit('ask4update', msg)
        }
    })
    socket.on('update', (msg) => {
        socket.to('recievers').emit('update', msg)

    })



}