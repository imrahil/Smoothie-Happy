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
    * @param  {String|Object}  address|settings  Board ip or hostname.
    * @param  {Object}         [settings]          Board settings.
    * @param  {String}         [settings.address]  Board ip or hostname.
    * @param  {Integer}        [settings.timeout]  Default response timeout in milliseconds.
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

        // ...
        console.log(this);
    };

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

            // resolve the promise
            return Promise.resolve(sh.BoardEvent('response', self, event));
        })
        .catch(function(event) {
            // unset online flag
            self.online = false;

            // reject the promise
            return Promise.reject(sh.BoardEvent('offline', self, event));
        });
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

})();
