(function () {
    'use strict';

    /**
    * On board response.
    *
    * @callback sh.Board~onResponse
    * @param  {object}  result  Request result.
    */

    /**
    * Board class.
    *
    * @class
    * @param  {String}               address   Board ip or hostname.
    * @param  {sh.Board~onResponse}  callback  Function to call on request result.
    *
    * {$examples sh.Board}
    */
    sh.Board = function(settings) {
        // defaults settings
        settings = settings || {};

        var address  = settings.address;
        var timeout  = settings.timeout;
        var callback = settings.callback;

        // invalid address type
        if (typeof address !== 'string') {
            throw new Error('Invalid address type.');
        }

        // Trim whitespaces
        address = address.trim();

        // address not provided or too short
        if (address.length <= 4) {
            throw new Error('Address too short.');
        }

        // instance factory
        if (! (this instanceof sh.Board)) {
            return new sh.Board(settings);
        }

        /**
        * @readonly
        * @property  {String}  address  Board ip or hostname.
        */
        this.address = address;

        /**
        * @readonly
        * @property  {Integer}  timeout  Default response timeout in milliseconds.
        * @default   null
        */
        this.timeout = timeout;

        /**
        * @readonly
        * @property  {Object}  info         Board info parsed from version command.
        * @property  {String}  info.branch  Firmware branch.
        * @property  {String}  info.hash    Firmware hash.
        * @property  {String}  info.date    Firmware date.
        * @property  {String}  info.mcu     Board MCU.
        * @property  {String}  info.clock   Board clock freqency.
        */
        this.info = null;

        // self alias
        var self = this;

        // Check the board version
        this.Version(callback);
    };

    /**
    * Send command line and return a Promise.
    *
    * @method
    * @param   {String}           command  Command line.
    * @param   {Integer}          timeout  Connection timeout in milliseconds.
    * @return  {sh.network.Post}  Promise
    */
    sh.Board.prototype.Command = function(command, timeout) {
        timeout = timeout === undefined ? this.timeout : timeout;
        return sh.network.Post({
            url    : 'http://' + this.address + '/command',
            data   : command.trim() + '\n',
            timeout: timeout
        });
    };

    /**
    * Get the board version.
    *
    * @method
    * @param   {sh.Board~onResponse}  callback  Function to call on request result.
    * @return  {sh.network.Post}      Promise
    */
    sh.Board.prototype.Version = function(callback) {
        // Self alias
        var self = this;

        // Make the request
        var promise = this.Command('version').then(function(event) {
            // error flag true by default
            var error = true;

            // version pattern
            // expected : Build version: edge-94de12c, Build date: Oct 28 2014 13:24:47, MCU: LPC1769, System Clock: 120MHz
            var pattern = /Build version: (.*), Build date: (.*), MCU: (.*), System Clock: (.*)/;

            // test the pattern
            var matches = event.response.raw.match(pattern);

            if (matches) {
                // split branch-hash on dash
                var branch = matches[1].split('-');

                // no error
                error = false;

                // response object
                self.info = {
                    branch: branch[0],
                    hash  : branch[1],
                    date  : matches[2],
                    mcu   : matches[3],
                    clock : matches[4]
                };
            }

            // return result for final then
            return { event: event, error: error, data: self.info };
        })
        .catch(function(event) {
            // return error for final then
            return { event: event, error: true, data: null };
        });

        // If final user callback
        callback && promise.then(callback);

        // Return the promise
        return promise;
    };

})();
