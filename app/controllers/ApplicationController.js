const pug = require('pug'),
    fs = require('fs'),
    uuidV4 = require('uuid/v4'),
    cookie = require('cookie'),
    Session = require('../models/Session'),
    session = new Session();

function ApplicationController() {
    this.variables = {};
    this.sessionId = null;
    this.session = {};
    this.maxAge = 1000 * 3600 * 24 * 7;

    this.setView = function (view) {
        this.view = view
    };

    this.setSync = function (sync) {
        this.sync = sync
    };

    this.setReqRes = function (req, res) {
        this.req = req;
        this.res = res;
    };

    this.setParams = function (params) {
        this.params = params;
    };

    this.permit = function (modelName, attributes) {
        var self = this;
        var param = {};
        var keys = Object.keys(self.params).filter(function (p) {
            var exec = new RegExp(modelName + '\\[(\\w+)\\]').exec(p);
            return exec && attributes.indexOf(exec[1]) != -1;
        });
        keys.forEach(function (k) {
            var exec = new RegExp(modelName + '\\[(\\w+)\\]').exec(k);
            param[exec[1]] = self.params[k];
        });
        return param;
    };

    this.respond = function respond(code, text) {
        var contentType = 'text/html';
        var self = this;
        this.res.writeHead(code, {'Content-type': contentType});
        if (text) this.res.end(text, 'utf-8');
        else if (this.view != null) {
            pug.renderFile('app/views/' + this.view + '.pug',
                this.variables,
                function (err, html) {
                    if (err) throw err;
                    self.res.end(html, 'utf-8');
                });
        } else this.res.end(text, 'utf-8');
        this.saveSession();
    };

    this.end = function (code, contentType, text) {
        this.res.writeHead(code, {'Content-type': contentType});
        this.res.end(text, 'utf-8');
        this.saveSession();
    };

    this.initSession = function (success) {
        let cookies = cookie.parse(this.req.headers.cookie || '');
        if (!cookies || !cookies['sessionId']) {
            this.res.setHeader('Set-Cookie', cookie.serialize('sessionId',
                uuidV4(),
                {
                    'maxAge': this.maxAge
                }));
            success();
        } else {
            this.sessionId = cookies['sessionId'];
            session.find(this.sessionId).then((session) => {
                this.session = session;
                success();
            }, () => {
                this.session = {};
                success();
            });
        }
    };

    this.saveSession = function () {
        if (this.sessionId)
            session.save(this.sessionId, this.session);
        this.sessionId = null;
        this.session = {};
    };

    this.sendFile = function (filename, contentType) {
        var self = this;
        contentType = contentType || 'text/html';
        fs.readFile(filename, function (error, content) {
            if (error != null) self.respond(404, "page not found");
            else {
                self.res.writeHead(200, {'Content-type': contentType});
                self.res.end(content, 'utf-8')
            }
        })
    };
}

module.exports = ApplicationController;