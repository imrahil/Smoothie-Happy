(function () {
    'use strict';

    /**
    * Board event.
    *
    * @class
    * @param  {sh.Board}                board        Board instance.
    * @param  {String}                  name         Event name.
    * @param  {Mixed|Error}             [data=null]  Event data (see data member description for more details).
    * @param  {sh.network.RequestEvent} [event=null] Original `sh.network.RequestEvent` instance.
    * @throws {Error}
    */
    sh.BoardEvent = function(board, name, data, event) {
        // instance factory
        if (! (this instanceof sh.BoardEvent)) {
            return new sh.BoardEvent(board, name, data, event);
        }

        /** @property {sh.Board} - Board instance. */
        this.board = board;

        /** @property {String} - Event name. */
        this.name = name;

        /**
        * - If NO error occured: can be anything depending on the command.
        * - If AN error occured: must be an `Error` instance.
        *
        * @property {Mixed|Error} - Event data
        * @default  null
        */
        this.data = data || null;

        /**
        * @property {sh.network.RequestEvent|null} - Original event.
        * @default  null
        */
        this.originalEvent = event || null;
    };

    /**
    * Board class.
    *
    * @class
    * @param {String|Object}      address|settings         Board address or settings.
    * @param {Object}             [settings]               Board settings.
    * @param {String}             [settings.address]       Board address (ip or hostname).
    * @param {Integer}            [settings.timeout]       Default response timeout in milliseconds for all commands.
    * @param {Integer|null|false} [settings.retryInterval] Retry interval in milliseconds for all commands.
    *
    * {$examples sh.Board}
    */
    sh.Board = function(address, settings) {
        // instance factory
        if (! (this instanceof sh.Board)) {
            return new sh.Board(address, settings);
        }

        // defaults settings
        settings = settings || {};

        // settings provided on first argument
        if (typeof address === 'object') {
            settings = address;
            address  = settings.address;
        }

        // Trim whitespaces
        address = address.trim();

        /**
        * @property {String} - Board address (ip or hostname).
        * @readonly
        */
        this.address = address;

        /**
        * @property {Integer} - Default response timeout in milliseconds for all commands.
        * @default 5000
        */
        this.timeout = settings.timeout || 5000;

        /**
        * @property {Object|null} info        Board info parsed from version command.
        * @property {String}      info.branch Firmware branch.
        * @property {String}      info.hash   Firmware hash.
        * @property {String}      info.date   Firmware date.
        * @property {String}      info.mcu    Board MCU.
        * @property {String}      info.clock  Board clock freqency.
        * @default
        * @readonly
        */
        this.info = null;

        /**
        * @property {Boolean} - Is board online.
        * @default
        * @readonly
        */
        this.online = false;

        /**
        * @property {Integer} - Last time the board was seen online.
        * @default
        * @readonly
        */
        this.lastOnlineTime = null;

        /**
        * @property {Object} - Subscriptions.
        * @protected
        */
        this._subscriptions = {};

        /**
        * @property {Integer} - Number of retry occured.
        * @default
        * @readonly
        */
        this.retryCount = 0;

        /**
        * @property {Integer} - Number of retry before rejection.
        * @default
        * @readonly
        */
        this.retryLimit = 5;

        /**
        * @property {Integer} - Retry interval in milliseconds for all commands.
        * @default 5000
        */
        this.retryInterval = settings.retryInterval || 5000;
    };

    // -------------------------------------------------------------------------

    /**
    * On command sent.
    *
    * @callback sh.Board~onCommand
    * @param {sh.BoardEvent} event Board event.
    */

    /**
    * On command response.
    *
    * @callback sh.Board~onResponse
    * @param {sh.BoardEvent} event Board event.
    */

    /**
    * On command error.
    *
    * @callback sh.Board~onError
    * @param {sh.BoardEvent} event Board event.
    */

    /**
    * On retry to send command.
    *
    * @callback sh.Board~onRetry
    * @param {sh.BoardEvent} event Board event.
    */

    // -------------------------------------------------------------------------

    /**
    * Subscription to an event.
    *
    * @method
    * @param  {String}      event          Event name.
    * @param  {Function}    callback       Function to call on event is fired.
    * @param  {Object|null} [context=null] Callback context to apply on call.
    * @return {this}
    *
    * @callbacks
    * | Name     | Type                                   | Description                 |
    * | -------- | -------------------------------------- | --------------------------- |
    * | command  | {@link sh.Board~onCommand|onCommand}   | Called on command sent.     |
    * | response | {@link sh.Board~onResponse|onResponse} | Called on command response. |
    * | error    | {@link sh.Board~onError|onError}       | Called on command error.    |
    * | retry    | {@link sh.Board~onRetry|onRetry}       | Called on command retry.    |
    */
    sh.Board.prototype.subscribe = function(event, callback, context) {
        // first subscription
        if (! this._subscriptions[event]) {
            // create callbacks collection
            this._subscriptions[event] = [];
        }

        // if not already registered
        if (this._subscriptions[event].indexOf(callback) === -1) {
            // register callback to collection
            this._subscriptions[event].push([callback, context || null]);
        }

        // -> this (chainable)
        return this;
    };

    /**
    * Publish an event with the scope of this class.
    *
    * @method
    * @param {String}                  name         Event name.
    * @param {Mixed|Error}             [data=null]  Event data (see {@link sh.network.BoardEvent}.data member for more details).
    * @param {sh.network.RequestEvent} [event=null] Original `sh.network.RequestEvent` instance.
    *
    * @return {sh.BoardEvent}
    */
    sh.Board.prototype.publish = function(name, data, event) {
        // create new board event
        event = new sh.BoardEvent(this, name, data, event);

        // call user callback with the scope of this instance
        var callbacks = this._subscriptions[name] || [];

        for (var callback, context, i = 0; i < callbacks.length; i++) {
            callbacks[i][0].call(callbacks[i][1] || this, event);
        }

        // return the board event
        return event;
    };

    // -------------------------------------------------------------------------

    /**
    * Publish the event and return an resolved Promise.
    *
    * @method
    * @protected
    * @param  {String}              name        Event name.
    * @param  {sh.network.Response} event       Resolved event.
    * @param  {Mixed|Error}         [data=null] Event data (see {@link sh.network.BoardEvent}.data member for more details).
    * @return {Promise}
    */
    sh.Board.prototype._resolveEvent = function(name, event, data) {
        return Promise.resolve(this.publish(name, data, event));
    };

    /**
    * Publish an `error` event and return an rejected Promise.
    *
    * - If an string is provided as raison, it will be converted to an `Error` instance.
    *
    * @method
    * @protected
    * @param  {sh.network.Response} event    Rejected event.
    * @param  {String|Error}        [raison] Reject raison.
    * @return {Promise}
    */
    sh.Board.prototype._rejectEvent = function(event, raison) {
        // force error instance
        if (typeof raison === 'string') {
            raison = new Error(raison);
        }

        return Promise.reject(this.publish('error', raison, event));
    };

    // -------------------------------------------------------------------------

    /**
    * Send a raw command to the board.
    *
    * @method
    * @param  {String|Object}      command                  Command to send or command settings object.
    * @param  {Object}             [settings]               Command settings (see {@link sh.network.Request} for more details).
    * @param  {String}             [settings.command]       Command to send.
    * @param  {Integer|null|false} [settings.retryInterval] Retry interval in milliseconds.
    * @return {sh.network.Request}
    *
    * {$examples sh.Board.command}
    */
    sh.Board.prototype.command = function(command, settings) {
        // self alias
        var self = this;

        // defaults settings
        settings = settings || {};

        // settings provided on first argument
        if (typeof command === 'object') {
            settings = command;
            command  = settings.command;
        }

        // clean command
        settings.command = command.trim() + '\n';

        // default response timeout
        if (settings.timeout === undefined) {
            settings.timeout = self.timeout;
        }

        // default retry interval
        if (settings.retryInterval === undefined) {
            settings.retryInterval = self.retryInterval;
        }

        // request settings
        settings.data = settings.command;
        settings.url  = 'http://' + self.address + '/command';

        // publish event
        self.publish('command', settings);

        // return POST request (promise)
        return sh.network.post(settings).then(function(event) {
            // set board online flag
            self.online = true;

            // reset retry counter
            self.retryCount = 0;

            // set board last online time
            self.lastOnlineTime = Date.now();

            // response text
            var raw = event.response.raw;

            // unsupported command...
            if (raw.indexOf('error:Unsupported command') === 0) {
                return Promise.reject({
                    rejected: true,
                    event   : event,
                    raison  : raw.substr(6)
                });
            }

            // resolve event
            return self._resolveEvent('response', event, raw);
        })
        .catch(function(event) {
            // fatal error in response
            if (event.rejected) {
                return self._rejectEvent(event.event, event.raison);
            }

            // unset online flag
            self.online = false;

            // increment retry counter
            self.retryCount++;

            // reject raison
            // like: upload.timeout: version\n
            var raison = new Error(event.name + ': ' + settings.command);

            // if retry limit not reached
            if (self.retryCount <= self.retryLimit) {
                // publish events
                self.publish('error', raison, event);
                self.publish('retry', settings, event);

                // create and return a new Promise
                return new Promise(function(resolve, reject) {
                    // delayed retry
                    setTimeout(function() {
                        self.command(settings).then(resolve).catch(reject);
                    }, settings.retryInterval);
                });
            }

            // reject event
            return self._rejectEvent(event, raison);
        });
    };

    // -------------------------------------------------------------------------

    /**
    * Send ok command to the board.
    *
    * @method
    * @param  {Object} [settings] Command settings (see {@link sh.Board~command} for more details).
    * @return {sh.network.Request}
    *
    * {$examples sh.Board.cmd_ok}
    */
    sh.Board.prototype.cmd_ok = function(settings) {
        // self alias
        var self = this;

        // send ok command as ping
        return self.command('ok', settings).then(function(event) {
            return self._resolveEvent('ok', event, 'ok');
        });
    };

    // -------------------------------------------------------------------------

    /**
    * Send version command to the board.
    *
    * @method
    * @param  {Object} [settings] Command settings (see {@link sh.Board~command} for more details).
    * @return {sh.network.Request}
    *
    * {$examples sh.Board.cmd_version}
    */
    sh.Board.prototype.cmd_version = function(settings) {
        // self alias
        var self = this;

        // send ok command as ping
        return self.command('version', settings).then(function(event) {
            // version string
            // expected : Build version: edge-94de12c, Build date: Oct 28 2014 13:24:47, MCU: LPC1769, System Clock: 120MHz
            var versionString = event.data.trim();

            // version pattern
            var versionPattern = /Build version: (.*), Build date: (.*), MCU: (.*), System Clock: (.*)/;

            // test the pattern
            var info = versionString.match(versionPattern);

            if (info) {
                // split branch-hash on dash
                var branch = info[1].split('-');

                // update board info
                self.info = {
                    branch: branch[0].trim(),
                    hash  : branch[1].trim(),
                    date  : info[2].trim(),
                    mcu   : info[3].trim(),
                    clock : info[4].trim()
                };

                // resolve event
                return self._resolveEvent('version', event, self.info);
            }

            // reject event
            return self._rejectEvent(event, 'Unknown version string');
        });
    };

})();
