var dms = require('../../libs/dms');

function Model() {
    this.find = function (key) {
        var self = this;
        return new Promise(function (success, fail) {
            dms.getTable(self.tableName).then(function (table) {
                if (table[key]) success(table[key]);
                fail();
            })
        });
    };

    this.findAll = function () {
        return dms.getTable(this.tableName);
    };

    this.findAllContains = function (key, caseSensitive) {
        var self = this;
        return new Promise(function (success, fail) {
            dms.getTable(self.tableName).then(function (table) {
                var keys = Object.keys(table).filter(function (k) {
                    return caseSensitive ? k.indexOf(key) != -1 : k.toLowerCase().indexOf(key.toLowerCase()) != -1;
                });
                if (keys.length > 0) {
                    var records = {};
                    keys.forEach(function (k) {
                        records[k] = table[k];
                    });
                    success(records);
                }
                fail();
            });
        });
    };

    this.save = function (key, value) {
        var self = this;
        return dms.getTable(this.tableName).then(function (table) {
            table[key] = value;
            return dms.saveTable(self.tableName, table);
        });
    };

    this.add = function (key, value) {
        var self = this;
        return new Promise(function (success, fail) {
            var checkRes = self.check(key, value);

            if (Object.keys(checkRes).length == 0) {
                dms.getTable(self.tableName).then(function (table) {
                    if (!table[key]) {
                        value['key'] = key;
                        table[key] = value;
                        dms.saveTable(self.tableName, table).then(function () {
                            success();
                        });
                    } else fail(null);
                });
            } else fail(checkRes);
        });
    };

    this.check = function (key, value) {
        return true;
    };

    this.delete = function (key) {
        var self = this;
        return dms.getTable(this.tableName).then(function (table) {
            delete table[key];
            return dms.saveTable(self.tableName, table);
        });
    };

    this.update = function (key, value) {
        var self = this;
        return new Promise(function (success, fail) {
            dms.getTable(self.tableName).then(function (table) {
                if (table[key]) {
                    Object.keys(value).forEach(function (k) {
                        table[key][k] = value[k];
                        dms.saveTable(self.tableName, table).then(function () {
                            success();
                        });
                    });
                }
                else fail(null);
            });
        });
    };
}

Model.prototype.constructor = Model;
Model.prototype = Object.create(null);

module.exports = Model;