var Model = require('./Model');

function User() {
    Model.call(this);

    this.tableName = 'user';

    this.check = function (key, value) {
        return true;
    };
}

module.exports = User;