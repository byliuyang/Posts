const WebSocketServer = require('ws').Server;
wsServer = module.exports =  {};

wsServer.init = (server) => {
    wsServer.ws = new WebSocketServer({server: server});

    wsServer.ws.on('connection', function msg_connection(ws) {
        ws.on('message', function msg_incoming(message) {

        });
    });
};