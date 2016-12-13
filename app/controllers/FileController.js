var ApplicationController = require('./ApplicationController.js');

var fs = require('fs')
    , url = require('url')
    , marked = require('marked');

function FileController() {
    ApplicationController.call(this);

    this.setPathname = function (pathname) {
        this.pathname = pathname;
    };

    this.css = function () {
        this.sendFile('public' + this.pathname, 'text/css');
    };

    this.js = function () {
        this.sendFile('public' + this.pathname, 'application/javascript');
    };

    this.png = function () {
        this.sendFile('public' + this.pathname, 'image/png');
    };

    this.jpg = function () {
        this.sendFile('public' + this.pathname, 'image/jpeg');
    };

    this.ico = function () {
        this.sendFile('public' + this.pathname, 'image/x-icon');
    };

    this.md = function () {
        this.setView('md');
        var self = this;
        fs.readFile('.' + url.parse(this.req.url).pathname, function (error, content) {
            if (error != null) self.respond(404, "page not found");
            else {
                self.variables['readme'] = marked(content.toString());
                self.respond(200);
            }
        });
    };
}

module.exports = FileController;