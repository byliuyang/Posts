const Model = require('./Model'),
    User = require('./User'),
    user = new User(),
    dms = require('../../libs/dms'),
    moment = require('moment');

function Post() {
    Model.call(this);

    this.tableName = 'post';

    this.check = function (key, value) {
        return true;
    };

    this.findAllWithUsers = function () {
        return new Promise((success, fail) => {
            user.findAll().then((users) => {

                dms.getTable(this.tableName).then((posts) => {
                    success(Object.keys(posts).map(postKey => {
                        posts[postKey].user = users[posts[postKey].user];
                        posts[postKey].timestamp = posts[postKey].time;
                        posts[postKey].time = moment(posts[postKey].time).fromNow();
                        return posts[postKey];
                    }));
                });
            });
        });
    };
}

module.exports = Post;