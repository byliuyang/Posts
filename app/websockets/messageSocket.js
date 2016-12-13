const WebSocketServer = require('ws').Server,
    wss = module.exports = new WebSocketServer({port: 8081});

wss.on('connection', function msg_connection(ws) {
    ws.on('message', function msg_incoming(message) {
    });
});