var Model = require('./Model');

function Session() {
    Model.call(this);

    this.tableName = 'session';

    this.check = function (key, value) {
        return true;
    };
}

module.exports = Session;