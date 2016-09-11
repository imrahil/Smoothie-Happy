(function () {
    'use strict';

    /**
    * Custom board event.
    *
    * @class
    * @param  {String}                   name   Event name.
    * @param  {sh.Board}                 board  Board instance.
    * @param  {sh.network.RequestEvent}  event  Original `sh.network.RequestEvent` instance.
    * @param  {Object|null}              data   Event data (depending on the command).
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
    * @param  {String|Object}  address|settings          Board ip or hostname.
    * @param  {Object}         [settings]                Board settings.
    * @param  {String}         [settings.address]        Board ip or hostname.
    * @param  {Integer}        [settings.timeout]        Response timeout in milliseconds.
    * @param  {Integer}        [settings.watchInterval]  Watch interval in milliseconds.
    * @param  {Integer}        [settings.watchTimeout]   Watch timeout in milliseconds.
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
        * @readonly
        * @property  {String}  address  Board ip or hostname.
        */
        this.address = address;

        /**
        * @readonly
        * @property  {String}  id  Board ip or hostname as DOM id.
        */
        this.id = address.replace(/[^0-9a-z_\-]+/gi, '-');

        /**
        * @readonly
        * @property  {Integer}  timeout  Default response timeout in milliseconds.
        * @default   5000
        */
        this.timeout = settings.timeout !== undefined ? settings.timeout : 5000;

        /**
        * @readonly
        * @property  {Object|null}  info         Board info parsed from version command.
        * @property  {String}       info.branch  Firmware branch.
        * @property  {String}       info.hash    Firmware hash.
        * @property  {String}       info.date    Firmware date.
        * @property  {String}       info.mcu     Board MCU.
        * @property  {String}       info.clock   Board clock freqency.
        * @default   null
        */
        this.info = null;

        /**
        * @readonly
        * @property  {Boolean}  online  Is board online.
        * @default   false
        */
        this.online = false;

        /**
        * @readonly
        * @property  {Integer}  lastOnlineTime Last time the board was seen online.
        * @default   null
        */
        this.lastOnlineTime = null;

        /**
        * @readonly
        * @property  {Boolean}  online  Is board connected.
        * @default   false
        */
        this.connected = false;

        /**
        * @readonly
        * @property  {Integer}  watchTimeoutId Connection timer id.
        * @default   null
        */
        this.watchTimeoutId = null;

        /**
        * @readonly
        * @property  {Integer}  watchInterval Connection timer interval.
        * @default   5000
        */
        this.watchInterval = settings.watchInterval || 5000;

        /**
        * @readonly
        * @property  {Integer}  watchInterval Connection timeout interval.
        * @default   5000
        */
        this.watchTimeout = settings.watchTimeout || 2000;

        /**
        * @readonly
        * @property  {Integer}  reconnectAttempts Number of reconnection attempts.
        * @default   0
        */
        this.reconnectAttempts = 0;

        /**
        * @readonly
        * @property  {Integer}  connections Number of successful connections from the first connection.
        * @default   0
        */
        this.connections = 0;

        /**
        * @readonly
        * @property  {Integer}  reconnections Number of successful reconnections from the last connection.
        * @default   0
        */
        this.reconnections = 0;

        /**
        * @protected
        * @property  {Object}  -  Registred callbacks.
        */
        this._on = {};
    };

    // -------------------------------------------------------------------------

    /**
    * On request response.
    *
    * @callback sh.Board~onResponse
    * @param  {sh.BoardEvent}  event  Board event.
    */

    /**
    * On request error.
    *
    * @callback sh.Board~onError
    * @param  {sh.BoardEvent}  event  Board event.
    */

    /**
    * On board connect.
    *
    * @callback sh.Board~onConnect
    * @param  {sh.BoardEvent}  event  Board event.
    */

    /**
    * On board disconnect.
    *
    * @callback sh.Board~onDisconnect
    * @param  {sh.BoardEvent}  event  Board event.
    */

    /**
    * On board reconnect.
    *
    * @callback sh.Board~onReconnect
    * @param  {sh.BoardEvent}  event  Board event.
    */

    /**
    * On board redisconnect.
    *
    * @callback sh.Board~onRedisconnect
    * @param  {sh.BoardEvent}  event  Board event.
    */

    /**
    * On watch board.
    *
    * @callback sh.Board~onWatch
    * @param  {sh.BoardEvent}  event  Board event.
    */

    // -------------------------------------------------------------------------

    /**
    * Register an event callback.
    *
    * @method
    * @param  {String}    event     Event name.
    * @param  {Function}  callback  Function to call on event is fired.
    * @return {self}
    *
    * @callbacks
    * | Name | Type | Description |
    * | ---- | ---- | ----------- |
    * | response      | {@link sh.Board~onResponse|onResponse}         | Called on request response.   |
    * | error         | {@link sh.Board~onError|onError}               | Called on request error.      |
    * | connect       | {@link sh.Board~onConnect|onConnect}           | Called on board connect.      |
    * | disconnect    | {@link sh.Board~onDisconnect|onDisconnect}     | Called on board disconnect.   |
    * | reconnect     | {@link sh.Board~onReconnect|onReconnect}       | Called on board reconnect.    |
    * | redisconnect  | {@link sh.Board~onRedisconnect|onRedisconnect} | Called on board redisconnect. |
    * | watch         | {@link sh.Board~onWatch|onWatch}               | Called on watch board.        |
    */
    sh.Board.prototype.on = function(event, callback) {
        // register callback
        this._on[event] = callback;

        // chainable
        return this;
    };

    /**
    * Trigger an user defined callback with the scope of this class.
    *
    * @method
    * @protected
    * @param  {String}  name   Event name.
    * @param  {String}  event  Original event.
    * @param  {Mixed}   data   Event data.
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
    * Send a command to the board.
    *
    * @method
    * @param   {String}           command  Command to send.
    * @param   {Integer}          timeout  Response timeout.
    * @return  {sh.network.Post}  Promise
    */
    sh.Board.prototype.Command = function(command, timeout) {
        // default response timeout
        if (timeout === undefined) {
            timeout = this.timeout;
        }

        // self alias
        var self = this;

        // return Post request (promise)
        return sh.network.Post({
            url    : 'http://' + this.address + '/command',
            data   : command.trim() + '\n',
            timeout: timeout
        })
        .then(function(event) {
            // set online flag
            self.online = true;

            // set last online time
            self.lastOnlineTime = Date.now();

            // trigger event
            var board_event = self._trigger('response', event);

            // resolve the promise
            return Promise.resolve(board_event);
        })
        .catch(function(event) {
            // unset online flag
            self.online = false;

            // trigger event
            var board_event = self._trigger('error', event);

            // reject the promise
            return Promise.reject(board_event);
        });
    };

    // -------------------------------------------------------------------------

    /**
    * Send ping command (ok).
    *
    * @method
    * @param   {Integer}          timeout  Response timeout.
    * @return  {sh.network.Post}  Promise
    */
    sh.Board.prototype.Ping = function(timeout) {
        return this.Command('ok', timeout);
    };

    /**
    * Get the board version.
    *
    * @method
    * @param   {Integer}          timeout  Response timeout.
    * @return  {sh.network.Post}  Promise
    */
    sh.Board.prototype.Version = function(timeout) {
        // self alias
        var self = this;

        // get board version (raw)
        return this.Command('version').then(function(event) {
            // raw version string
            // expected : Build version: edge-94de12c, Build date: Oct 28 2014 13:24:47, MCU: LPC1769, System Clock: 120MHz
            var raw_version = event.originalEvent.response.raw;

            // version pattern
            var version_pattern = /Build version: (.*), Build date: (.*), MCU: (.*), System Clock: (.*)/;

            // test the pattern
            var info = raw_version.match(version_pattern);

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
            }

            // resolve the promise
            return Promise.resolve(sh.BoardEvent('version', self, event, self.info));
        });
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
            self.Ping(self.watchTimeout).then(function(event) {
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
    * @param   {Integer}          timeout  Connection timeout.
    * @return  {sh.network.Post}  Promise
    */
    sh.Board.prototype.Connect = function(timeout) {
        // already connected
        if (this.connected) {
            throw new Error('Already connected.');
        }

        // reset reconnection attempts
        this.reconnectAttempts = 0;

        // self alias
        var self = this;

        // get board version
        return this.Version(timeout).then(function(event) {
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
    * @return
    */
    sh.Board.prototype.Disconnect = function() {
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
