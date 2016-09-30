(function () {
    'use strict';

    /**
    * Custom board event.
    *
    * @class
    *
    * @param {String}                  name  Event name.
    * @param {sh.Board}                board Board instance.
    * @param {sh.network.RequestEvent} event Original `sh.network.RequestEvent` instance.
    * @param {Object|null}             data  Event data (depending on the command).
    */
    sh.BoardEvent = function(name, board, event, data) {
        // instance factory
        if (! (this instanceof sh.BoardEvent)) {
            return new sh.BoardEvent(name, board, event, data);
        }

        /** @property  {String}  -  Event name. */
        this.name = name;

        /** @property  {sh.Board}  -  Board instance. */
        this.board = board;

        /** @property  {Object|null}  -  Event data (depending on the command). */
        this.data = data || null;

        /** @property  {sh.network.RequestEvent}  -  Original `sh.network.RequestEvent` instance. */
        this.originalEvent = event;
    };

    /**
    * Board class.
    *
    * @class
    *
    * @param {String|Object} address|settings         Board ip or hostname.
    * @param {Object}        [settings]               Board settings.
    * @param {String}        [settings.address]       Board ip or hostname.
    * @param {Integer}       [settings.timeout]       Response timeout in milliseconds.
    * @param {Integer}       [settings.watchInterval] Watch interval in milliseconds.
    * @param {Integer}       [settings.watchTimeout]  Watch timeout in milliseconds.
    *
    * {$examples sh.Board}
    */
    sh.Board = function(address, settings) {
        // defaults settings
        settings = settings || {};

        // settings provided on first argument
        if (typeof address === 'object') {
            settings = address;
            address  = settings.address;
        }

        // invalid address type
        if (typeof address !== 'string') {
            throw new Error('Address must be a string.');
        }

        // Trim whitespaces
        address = address.trim();

        // address not provided or too short
        if (!address || address.length <= 4) {
            throw new Error('Address too short [min.: 4].');
        }

        // instance factory
        if (! (this instanceof sh.Board)) {
            return new sh.Board(address, settings);
        }

        /**
        * @property {String} address Board ip or hostname.
        * @readonly
        */
        this.address = address;

        /**
        * @property {String} id Board ip or hostname as DOM id.
        * @readonly
        */
        this.id = address.replace(/[^0-9a-z_\-]+/gi, '-');

        /**
        * @property {Integer} timeout Default response timeout in milliseconds.
        * @default 5000
        * @readonly
        */
        this.timeout = settings.timeout !== undefined ? settings.timeout : 5000;

        /**
        * @property {Object|null} info        Board info parsed from version command.
        * @property {String}      info.branch Firmware branch.
        * @property {String}      info.hash   Firmware hash.
        * @property {String}      info.date   Firmware date.
        * @property {String}      info.mcu    Board MCU.
        * @property {String}      info.clock  Board clock freqency.
        * @default
        *
        * @readonly
        */
        this.info = null;

        /**
        * @property {Boolean} online Is board online.
        * @default
        * @readonly
        */
        this.online = false;

        /**
        * @property {Integer} lastOnlineTime Last time the board was seen online.
        * @default
        * @readonly
        */
        this.lastOnlineTime = null;

        /**
        * @property {Boolean} online Is board connected.
        * @default
        * @readonly
        */
        this.connected = false;

        /**
        * @property {Integer} watchTimeoutId Connection timer id.
        * @default
        * @readonly
        */
        this.watchTimeoutId = null;

        /**
        * @property {Integer} watchInterval Connection timer interval.
        * @default 5000
        * @readonly
        */
        this.watchInterval = settings.watchInterval || 5000;

        /**
        * @property {Integer} watchInterval Connection timeout interval.
        * @default 2000
        * @readonly
        */
        this.watchTimeout = settings.watchTimeout || 2000;

        /**
        * @property {Integer} reconnectAttempts Number of reconnection attempts.
        * @default
        * @readonly
        */
        this.reconnectAttempts = 0;

        /**
        * @property {Integer} connections Number of successful connections from the first connection.
        * @default
        * @readonly
        */
        this.connections = 0;

        /**
        * @property {Integer} reconnections Number of successful reconnections from the last connection.
        * @default
        * @readonly
        */
        this.reconnections = 0;

        /**
        * @property {Object} - Registred callbacks.
        * @protected
        */
        this._on = {};
    };

    // -------------------------------------------------------------------------

    /**
    * On request response.
    *
    * @callback sh.Board~onResponse
    *
    * @param {sh.BoardEvent} event Board event.
    */

    /**
    * On request error.
    *
    * @callback sh.Board~onError
    *
    * @param {sh.BoardEvent} event Board event.
    */

    /**
    * On board connect.
    *
    * @callback sh.Board~onConnect
    *
    * @param {sh.BoardEvent} event Board event.
    */

    /**
    * On board disconnect.
    *
    * @callback sh.Board~onDisconnect
    *
    * @param {sh.BoardEvent} event Board event.
    */

    /**
    * On board reconnect.
    *
    * @callback sh.Board~onReconnect
    *
    * @param {sh.BoardEvent} event Board event.
    */

    /**
    * On board redisconnect.
    *
    * @callback sh.Board~onRedisconnect
    *
    * @param {sh.BoardEvent} event Board event.
    */

    /**
    * On watch board.
    *
    * @callback sh.Board~onWatch
    *
    * @param {sh.BoardEvent} event Board event.
    */

    // -------------------------------------------------------------------------

    /**
    * Register an event callback.
    *
    * @method
    *
    * @param {String}   event    Event name.
    * @param {Function} callback Function to call on event is fired.
    *
    * @return {this}
    *
    * @callbacks
    * | Name         | Type                                           | Description                   |
    * | ------------ | ---------------------------------------------- | ----------------------------- |
    * | response     | {@link sh.Board~onResponse|onResponse}         | Called on request response.   |
    * | error        | {@link sh.Board~onError|onError}               | Called on request error.      |
    * | connect      | {@link sh.Board~onConnect|onConnect}           | Called on board connect.      |
    * | disconnect   | {@link sh.Board~onDisconnect|onDisconnect}     | Called on board disconnect.   |
    * | reconnect    | {@link sh.Board~onReconnect|onReconnect}       | Called on board reconnect.    |
    * | redisconnect | {@link sh.Board~onRedisconnect|onRedisconnect} | Called on board redisconnect. |
    * | watch        | {@link sh.Board~onWatch|onWatch}               | Called on watch board.        |
    */
    sh.Board.prototype.on = function(event, callback) {
        // register callback
        this._on[event] = callback;

        // -> this (chainable)
        return this;
    };

    /**
    * Trigger an user defined callback with the scope of this class.
    *
    * @method
    * @protected
    *
    * @param {String} name  Event name.
    * @param {String} event Original event.
    * @param {Mixed}  data  Event data.
    *
    * @return {sh.BoardEvent}
    */
    sh.Board.prototype._trigger = function(name, event, data) {
        // to board event
        event = sh.BoardEvent(name, this, event, data);

        // if defined, call user callback with the scope of this instance
        this._on[name] && this._on[name].call(this, event);

        // return the board event
        return event;
    };

    // -------------------------------------------------------------------------

    /**
    * Watch periodicaly if the board is online.
    *
    * @protected
    * @method
    */
    sh.Board.prototype._watchConnection = function() {
        // not connected
        if (! this.connected) {
            throw new Error('Not connected.');
        }

        // next interval offset
        var intervalOffset = Date.now() - this.lastOnlineTime;

        // next interval timeout
        var nextInterval = this.watchInterval;

        // adjust interval (save some request, anti flood)
        if (intervalOffset < this.watchInterval) {
            nextInterval += intervalOffset;
        }

        // self alias
        var self = this;

        // new timeout
        this.watchTimeoutId = setTimeout(function() {
            // board online status before ping
            var online = self.online;

            // send ping command
            self.ping(self.watchTimeout).then(function(event) {
                // if online flag as changed
                if (! online) {
                    // reset reconnection attempts
                    self.reconnectAttempts = 0;

                    // increment reconnections counter
                    self.reconnections++;

                    // trigger events
                    self._trigger('connect', event);
                    self._trigger('reconnect', event);
                }

                // return the event
                return event;
            })
            .catch(function(event) {
                // if online flag as changed
                if (! online) {
                    // increment reconnection attempts
                    self.reconnectAttempts++;
                    self._trigger('reconnectAttempt', event, {
                        attempts: self.reconnectAttempts
                    });
                }
                else {
                    // trigger events
                    self._trigger('disconnect', event);

                    if (self.reconnections > 0) {
                        self._trigger('redisconnect', event);
                    }
                }

                // return the event
                return event;
            })
            .then(function(event) {
                // not connected
                if (! self.connected) {
                    // stop watching
                    return null;
                }

                // trigger watch event
                self._trigger('watch', event);

                // next connection watch
                self._watchConnection();
            });

        }, nextInterval);
    };

    /**
    * Connect the board (watch periodicaly if the board is online).
    *
    * @method
    *
    * @param {Integer} [timeout] Connection timeout.
    *
    * @return {sh.network.Request}
    *
    * {$examples sh.Board.connect}
    */
    sh.Board.prototype.connect = function(timeout) {
        // already connected
        if (this.connected) {
            throw new Error('Already connected.');
        }

        // reset reconnection attempts
        this.reconnectAttempts = 0;

        // self alias
        var self = this;

        // get board version
        return this.version(timeout).then(function(event) {
            // set connected flag
            self.connected = true;

            // reset reconnection counter
            self.reconnections = 0;

            // increment connections counter
            self.connections++;

            // start watching
            self._watchConnection();

            // trigger event
            var board_event = self._trigger('connect', event);

            // resolve the promise
            return Promise.resolve(board_event);
        });
    };

    /**
    * Disconnect the board (stop watching periodicaly if the board is online).
    *
    * @method
    * @return {Promise}
    *
    * {$examples sh.Board.disconnect}
    */
    sh.Board.prototype.disconnect = function() {
        // not connected
        if (! this.connected) {
            throw new Error('Not connected.');
        }

        // stop watching the connection
        clearTimeout(this.watchTimeoutId);
        this.watchTimeoutId = null;

        // set connected flag
        this.connected = false;

        // trigger event
        var board_event = this._trigger('disconnect');

        // resolve the promise
        return Promise.resolve(board_event);
    };

})();
