const ApplicationController = require('./ApplicationController.js'),
    Post = require('../models/Post'),
    post = new Post(),
    User = require('../models/User'),
    user = new User(),
    messageSocket = require('../websockets/messageSocket'),
    uuidV4 = require('uuid/v4'),
    moment = require('moment');

function PostController() {
    ApplicationController.call(this);

    this.index = function () {
        let userId = this.session["userId"];
        if (!userId)
            userId = randomUserId(15);

        this.session["userId"] = userId;
        this.variables['userId'] = userId;
        user.find(userId).then((user) => {
            sendPosts(this, user);
        }, () => {
            let u = {"avatar": {"icon": randomIcon(), 'theme': randomTheme()}};
            user.add(userId, u).then(() => {
                sendPosts(this, u);
            })
        });
    };

    this.show = function () {
    };

    this.new = function () {
    };

    this.create = function () {
        let userId = this.session["userId"];
        if (!userId)
            this.end(403);
        else {
            let p = postParams(this);
            p['user'] = userId;
            p['time'] = new Date().getTime();
            post.add(uuidV4(), p).then(() => {
                user.find(userId).then((user) => {
                    p.timestamp = p.time;
                    p.time = moment(p.time).fromNow();
                    p.user = user;
                    messageSocket.ws.clients.forEach((client) => {
                        client.send(JSON.stringify(p));
                    });
                    this.end(200, 'application/json');
                });

            }, () => {
                this.end(409);
            });
        }
    };

    this.destroy = function () {
    };

    this.update = function () {
    };
}

function sendPosts(self, u) {
    self.variables['user'] = u;
    post.findAllWithUsers()
        .then((posts) => {
            self.variables['posts'] = posts.sort((p1, p2) => p2.timestamp - p1.timestamp);
            self.respond(200);
        });
}

function randomUserId(length) {
    let alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = [];
    for (let i = 0; i < length; i++)
        result.push(alphabet.charAt([random(0, alphabet.length)]))
    return result.join('');
}

function postParams(self) {
    return self.permit('post',
        ['latitude',
            'longitude',
            'message']);
}

function randomTheme() {
    let themes = [
        'red',
        'pink',
        'purple',
        'deep-purple',
        'indigo',
        'blue',
        'light-blue',
        'cyan',
        'teal',
        'green',
        'light-green',
        'lime',
        'yellow',
        'amber',
        'orange',
        'deep orange',
        'brown',
        'grey',
        'blue-grey'
    ];
    return themes[random(0, themes.length)];
}

function randomIcon() {
    let icons = [
        'android',
        'angularjs',
        'apache',
        'atom',
        'backbonejs',
        'bitbucket',
        'bootstrap',
        'bower',
        'c',
        'chrome',
        'codeigniter',
        'coffeescript',
        'confluence',
        'cplusplus',
        'chsarp',
        'css3',
        'd3js',
        'debian',
        'django',
        'docker',
        'doctrine',
        'dot-net',
        'drupal',
        'erlang',
        'firfox',
        'foundation',
        'gimp',
        'git',
        'github',
        'gitlab',
        'go',
        'grunt',
        'glup',
        'heroku',
        'html5',
        'ie10',
        'illustrator',
        'inkscape',
        'java',
        'javascript',
        'jeet',
        'jquery',
        'karkenjs',
        'laravel',
        'less',
        'linux',
        'mongodb',
        'mysql',
        'nginx',
        'nodejs',
        'php',
        'rails',
        'python',
        'postgresql',
        'atom',
        'sass',
        'ssh',
        'ubuntu',
        'vim'
    ];
    return icons[random(0, icons.length)];
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = PostController;