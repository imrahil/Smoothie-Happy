/**
 * Smoothie-Happy global namespace.
 * @namespace
 */
var sh = sh || {};

 (function () {
    'use strict';

    // -------------------------------------------------------------------------

    /** @property {String} */
    sh.name = 'smoothie-happy';

    /** @property {String} */
    sh.version = '0.0.1-alpha';

    /** @property {String} */
    sh.description = 'Smoothieware network communication API.';

    /** @property {String} */
    sh.link = 'https://github.com/lautr3k/Smoothie-Happy';

    // -------------------------------------------------------------------------

    /**
     * Network module.
     * @namespace
     */
    sh.network = {
        /**
         * @property {Integer} timeout Default timeout for all request (ms).
         * @default  5000
         */
        timeout: 5000
    };

    /**
     * XMLHttpRequest wrapper.
     * @method sh.network.request
     * @param  {String}  type              'GET' or 'POST'.
     * @param  {String}  url               URL with protocol.
     * @param  {Object}  settings          Request settings.
     * @param  {Mixed}   settings.data     Data to send with the request.
     * @param  {Object}  settings.headers  Headers to send with the request.
     * @param  {Object}  settings.options  {XMLHttpRequest} properties/methods to overwrite.
     * @return {XMLHttpRequest}
     */
    sh.network.request = function(type, url, settings) {
        // force type to uppercase
        type = type.toUpperCase();

        // defaults settings
        settings = settings || {};

        var data     = settings.data    || null;
        var headers  = settings.headers || {};
        var options  = settings.options || settings;

        // http request object
        var xhr = new XMLHttpRequest();

        // open the request
        xhr.open(type, url, true);

        // set default xhr properties
        options.timeout = options.timeout || this.timeout;

        // set user xhr properties
        for (var key in options) {
            if (key === 'upload') {
                for (var event in options[key]) {
                    if (xhr.upload[event] !== undefined) {
                        xhr.upload[event] = options[key][event];
                    }
                }
            }
            else if (xhr[key] !== undefined) {
                xhr[key] = options[key];
            }
        }

        // append data to url on GET request
        if (type === 'GET' && data) {
            url += data;
            data = null;
        }

        // set custom headers
        for (var key in headers) {
            xhr.setRequestHeader(key, headers[key]);
        }

        // send the request
        xhr.send(type === 'POST' ? data : null);

        // return the request object
        return xhr;
    };

    /**
     * GET request.
     * @method sh.network.get
     * @param  {String}  url       URL with protocol.
     * @param  {Mixed}   settings  See "{@link sh.network.request}.settings".
     * @return {XMLHttpRequest}
     */
    sh.network.get = function(url, settings) {
        return this.request('GET', url, settings);
    };

    /**
     * POST request.
     * @method sh.network.post
     * @param  {String}  url       URL with protocol.
     * @param  {Mixed}   settings  See "{@link sh.network.request}.settings".
     * @return {XMLHttpRequest}
     */
    sh.network.post = function(url, settings) {
        return this.request('POST', url, settings);
    };

    /**
     * Upload a file on the sd card.
     * @method sh.network.upload
     * @param  {String}      ip        Board ip.
     * @param  {Object|File} file      {File} object or an {Object} with "name" and "data" properties set.
     * @param  {Mixed}       settings  See "{@link sh.network.request}.settings".
     * @return {XMLHttpRequest}
     */
    sh.network.upload = function(ip, file, settings) {
        // defaults settings
        settings = settings || {};

        // file is a string, convert to Blob
        if (typeof file === 'string') {
            file = new Blob([file], { 'type': 'text/plain' });
        }

        // file is a File or Blob object, wrap it...
        if (file instanceof File || file instanceof Blob) {
            file = {
                name: file.name,
                data: file
            }
        }

        // set file data
        settings.data = file.data;

        // set file name header
        settings.headers = { 'X-Filename': file.name };

        // send the command as post request
        return this.post('http://' + ip + '/upload', settings);
    };

    /**
     * Send a raw command.
     * @method sh.network.command
     * @param  {String}    ip                   Board ip.
     * @param  {String}    command              The command string. See {@link http://smoothieware.org/console-commands} for a complete list.
     * @param  {Mixed}     settings             See "{@link sh.network.request}.settings".
     * @param  {Function}  settings.parser      Function who take the response text as parameter and return the parsed response.
     * @param  {Function}  settings.onresponse  Function called when the response is parsed.
     * @return {XMLHttpRequest}
     */
    sh.network.command = function(ip, command, settings) {
        // defaults settings
        settings = settings || {};

        // default response parser callback
        settings.parser = settings.parser || null;

        // default response callback
        settings.onresponse = settings.onresponse || null;

        // user on load callback
        var onload = settings.onload || function() {};

        // internal onload callback
        settings.onload = function(event) {
            // call onload user callbacks
            onload.call(this, event);

            if (settings.onresponse) {
                // raw response text
                var raw = this.responseText;

                // no data by default
                var data = null;

                // parse the raw response
                if (settings.parser) {
                    data = settings.parser.call(this, raw);
                }

                // response object
                var response = { error: null, raw : raw, data: data };

                // data type check
                if (typeof data !== 'object') {
                    if (typeof data === 'string') {
                        // error message provided
                        response.error = data.trim();
                    }
                    else {
                        // default message
                        response.error = 'Unknown error';
                    }

                    // delete data property
                    delete response.data;
                }

                // call onresponse user callback
                settings.onresponse.call(this, response);
            }
        };

        // set the command as request data
        settings.data = command.trim() + '\n';

        // send the command as post request
        return this.post('http://' + ip + '/command', settings);
    };

    // -------------------------------------------------------------------------

    /**
     * Command module.
     * @namespace
     * @see http://smoothieware.org/console-commands
     */
    sh.command = {};

    /**
     * Get the board/firmware version.
     * @method sh.command.version
     * @param  {String} ip        Board ip.
     * @param  {Mixed}  settings  See "{@link sh.network.command}.settings".
     * @return {XMLHttpRequest}
     */
    sh.command.version = function(ip, settings) {
        // defaults settings
        settings = settings || {};

        // set the command
        var command = 'version';

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            // version pattern
            // expected : Build version: edge-94de12c, Build date: Oct 28 2014 13:24:47, MCU: LPC1769, System Clock: 120MHz
            var pattern = /Build version: (.*), Build date: (.*), MCU: (.*), System Clock: (.*)/;

            // test the pattern
            var matches = raw.match(pattern);

            if (matches) {
                // split branch-hash on dash
                var branch = matches[1].split('-');

                // response object
                return {
                    branch: branch[0],
                    hash  : branch[1],
                    date  : matches[2],
                    mcu   : matches[3],
                    clock : matches[4]
                };
            }

            // not found
            return 'No version found';
        };

        // send the comand
        sh.network.command(ip, command, settings);
    };

    /**
     * Get information about RAM usage.
     * @method sh.command.mem
     * @param  {String} ip        Board ip.
     * @param  {Mixed}  settings  See "{@link sh.network.command}.settings".
     * @return {XMLHttpRequest}
     */
    sh.command.mem = function(ip, settings) {
        // defaults settings
        settings = settings || {};

        // set verbosity
        var verbose = settings.verbose ? ' -v' : '';

        // set the command
        var command = 'mem' + verbose;

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            // split response text on new lines
            return { lines: raw.trim().split('\n') };
        };

        // send the comand
        sh.network.command(ip, command, settings);
    };

    /**
     * List the files in the folder passed as a parameter.
     * @method sh.command.ls
     * @param  {String} ip        Board ip.
     * @param  {String} path      Path to list, can be absolute or relative.
     * @param  {Mixed}  settings  See "{@link sh.network.command}.settings".
     * @return {XMLHttpRequest}
     */
    sh.command.ls = function(ip, path, settings) {
        // defaults settings
        settings = settings || {};

        // set the command
        var command = 'ls -s ' + path;

        // default filename filter callback
        settings.filter = settings.filter  || null;

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            // error
            if (raw.indexOf('Could not open directory') === 0) {
                return raw;
            }

            // split file on new line
            var files = raw.trim().split('\n');

            // filter files
            if (settings.filter) {
                files = files.filter(settings.filter);
            }

            // extract file name/size
            files = files.map(function(value) {
                value = value.split(' ');
                return {
                    path: path,
                    name: value[0],
                    size: value[1]
                }
            });

            // return files
            return { files: files };
        };

        // send the command
        sh.network.command(ip, command, settings);
    };

    /**
     * Change the current folder to the folder passed as a parameter.
     * @method sh.command.cd
     * @param  {String} ip        Board ip.
     * @param  {String} path      Path to folder, can be absolute or relative.
     * @param  {Mixed}  settings  See "{@link sh.network.command}.settings".
     * @return {XMLHttpRequest}
     */
    sh.command.cd = function(ip, path, settings) {
        // defaults settings
        settings = settings || {};

        // set the command
        var command = 'cd ' + path;

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            var error = raw.trim();
            return error.length ? error : true;
        };

        // send the comand
        sh.network.command(ip, command, settings);
    };

    /**
     * Get the content of the file given as a parameter to the standard output,
     * limited to number of limit lines if that parameter is passed.
     * @method sh.command.cat
     * @param  {String} ip        Board ip.
     * @param  {String} path      Path to file, can be absolute or relative.
     * @param  {Mixed}  settings  See "{@link sh.network.command}.settings".
     * @return {XMLHttpRequest}
     */
    sh.command.cat = function(ip, path, settings) {
        // defaults settings
        settings = settings || {};

        // set limit if requested
        var limit = settings.limit ? (' ' + settings.limit) : '';

        // set the command
        var command = 'cat ' + path + limit;

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            // error
            if (raw.indexOf('File not found') === 0) {
                return raw;
            }

            return { lines: raw.split('\n') };
        };

        // send the comand
        sh.network.command(ip, command, settings);
    };

})();
