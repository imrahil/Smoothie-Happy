(function () {
    'use strict';

    /**
    * Commands class.
    *
    * @class
    *
    * @param {sh.Board} board Board instance.
    *
    */
    sh.Commands = function(board) {
        /**
        * @property {sh.Board} board Board instance.
        * @readonly
        */
        this.board = board;

        /**
        * @property {Integer} timeout Default response timeout in milliseconds (set from board instance).
        * @readonly
        */
        this.timeout = board.timeout;
    };

    /**
    * Trigger the event and return an rejected Promise.
    *
    * @method
    * @protected
    *
    * @param {sh.network.Response} event    Event instance to reject.
    * @param {String|Error}        [raison] Reject raison.
    *
    * @return {Promise}
    */
    sh.Commands.prototype._rejectEvent = function(event, raison) {
        // raison from event
        if (raison === undefined) {
            // smothing like : "upload.timeout: version"
            raison = event.name + ': ' + event.request._data;
        }

        // force error instance
        if (typeof raison === 'string') {
            raison = new Error(raison);
        }

        // trigger the event and return an rejected Promise.
        return Promise.reject(this.board._trigger('error', event, raison));
    };

    /**
    * Trigger the event and return an resolved Promise.
    *
    * @method
    * @protected
    *
    * @param {String}              name   Event name.
    * @param {sh.network.Response} event  Event instance to reject.
    * @param {Mixed}               [data] Event data.
    *
    * @return {Promise}
    */
    sh.Commands.prototype._resolveEvent = function(name, event, data) {
        return Promise.resolve(this.board._trigger(name, event, data));
    };

    /**
    * Send a command to the board.
    *
    * @method
    *
    * @param {String}  command   Command to send.
    * @param {Object}  settings  Command settings.
    *
    * @return {sh.network.Request}
    */
    sh.Commands.prototype.send = function(command, settings) {
        // self alias
        var self = this;

        // clean command
        command = command.trim() + '\n';

        // default settings
        settings = settings || {};

        // default response timeout
        if (settings.timeout === undefined) {
            settings.timeout = this.timeout;
        }

        // request settings
        settings.data = command;
        settings.url  = 'http://' + this.board.address + '/command';

        // trigger event
        self.board._trigger('command', null, settings);

        // return POST request (promise)
        return sh.network.post(settings).then(function(event) {
            // set board online flag
            self.board.online = true;

            // set board last online time
            self.board.lastOnlineTime = Date.now();

            // unsupported command...
            if (event.response.raw.indexOf('error:Unsupported command') === 0) {
                return self._rejectEvent(event, event.response.raw.substr(6));
            }

            // resolve the promise
            return self._resolveEvent('response', event);
        })
        .catch(function(event) {
            // unset online flag
            self.online = false;

            // reject the promise
            return self._rejectEvent(event);
        });
    };

})();
