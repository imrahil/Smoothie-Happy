(function () {
    'use strict';

    /**
    * Commands module.
    *
    * @namespace
    */
    sh.commands = {};

    /**
    * Parse command response.
    *
    * Return the parsed response data as object or an Error instance.
    *
    * @function
    * @param  {String} command Command name.
    * @param  {String} raw     Raw command response string.
    * @return {Object|Error}
    */
    sh.commands.parse = function(command, raw) {
        // split command name and aguments
        var args = command.split(' ');
        var name = args.shift();

        // if undefined parser
        if (! sh.commands.parsers[name]) {
            // return an Error message
            return new Error('Sorry! The ' + name + ' command parser is not (yet) implemented.');
        }

        // parse the command response
        var result = sh.commands.parsers[name](raw, args);

        // Oups!
        if (result.error) {
            return new Error(result.data);
        }

        // return result data
        return result.data;
    };

    // -------------------------------------------------------------------------

    /**
    * Commands parsers collection.
    *
    * @namespace
    */
    sh.commands.parsers = {};

    /**
    * Make and return an error response data object.
    *
    * @function
    * @protected
    * @param  {String} raison
    * @return {Object}
    */
    sh.commands.parsers._error = function(raison) {
        return { error: true, data: raison };
    };

    /**
    * Make and return an success response data object.
    *
    * @function
    * @protected
    * @param  {Mixed} data
    * @return {Object}
    */
    sh.commands.parsers._success = function(data) {
        return { error: false, data: data };
    };

    // -------------------------------------------------------------------------

    /**
    * Parse ok command response.
    *
    * @function
    * @param  {String}   raw  Raw command response string.
    * @param  {String[]} args Command arguments.
    * @return {Object}
    * @example
    * ### on success
    * ```
    * return { error: false, data: "ok" }
    * ```
    * ### on error
    * ```
    * return { error: true, data: "ko" }
    * ```
    */
    sh.commands.parsers.ok = function(raw, args) {
        return raw.trim() === 'ok' ? this._success('ok') : this._error('ko');
    };

    // -------------------------------------------------------------------------

    /**
    * Parse version command response.
    *
    * @function
    * @param  {String}   raw  Raw command response string.
    * @param  {String[]} args Command arguments.
    * @return {Object}
    * @example
    * ### on success
    * ```
    * return {
    *     error: false,
    *     data : {
    *         branch: "edge",
    *         hash  : "9ab4538",
    *         date  : "Oct 10 2016 04:09:42",
    *         mcu   : "LPC1769",
    *         clock : "120MHz"
    *     }
    * }
    * ```
    * ### on error
    * ```
    * return { error: true, data: "Unknown version string" }
    * ```
    */
    sh.commands.parsers.version = function(raw, args) {
        // version pattern
        var pattern = /Build version: (.*), Build date: (.*), MCU: (.*), System Clock: (.*)/;

        // test the pattern
        var info = raw.trim().match(pattern);

        if (info) {
            // split branch-hash on dash
            var branch = info[1].split('-');

            // resolve
            return this._success({
                branch: branch[0].trim(),
                hash  : branch[1].trim(),
                date  : info[2].trim(),
                mcu   : info[3].trim(),
                clock : info[4].trim()
            });
        }

        // reject
        return this._error('Unknown version string');
    };

})();
