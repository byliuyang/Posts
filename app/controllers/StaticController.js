ApplicationController = require('./ApplicationController.js');
module.exports = StaticController;

function StaticController() {
    ApplicationController.call(this);
    this.index = function () {
        this.setView('post/index');
        this.respond(200);
    };
}

