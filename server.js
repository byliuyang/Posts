var http = require('http'),
    fs = require('fs'),
    url = require('url'),
    port = 8080,
    marked = require('marked'),
    router = require('./libs/router'),
    messsageSocket = require('./app/websockets/messageSocket');

// Set syntax highlight for markdown code snippets
marked.setOptions({
    highlight: function (code) {
        return require('highlight.js').highlightAuto(code).value;
    }
});

const server = http.createServer(function (req, res) {
    router.resolve(req, res);
});

server.listen(process.env.PORT || port);
console.log('listening on ' + (process.env.PORT || port));


