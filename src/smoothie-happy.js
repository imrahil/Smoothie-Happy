+function (global) {

    // -------------------------------------------------------------------------
    // global namespace
    // -------------------------------------------------------------------------
    var sh = {
        version    : '0.0.1-alpha',
        name       : 'Smoothie Happy',
        description: 'Smoothieware network communication API.',
        link       : 'https://github.com/lautr3k/Smoothie-Happy'
    };

    // -------------------------------------------------------------------------
    // network namespace
    // -------------------------------------------------------------------------
    sh.network = {
        timeout: 5000
    };

    // XMLHttpRequest wrapper
    sh.network.request = function(type, uri, settings) {
        // force type to uppercase
        type = type.toUpperCase();

        // defaults settings
        settings = settings || {};

        var data     = settings.data    || null;
        var headers  = settings.headers || {};
        var options  = settings.options || settings;

        // force some headers
        headers['Cache-Control'] = 'no-cache';
        headers['Pragma']        = 'no-cache';

        // http request object
        var xhr = new XMLHttpRequest();

        // open the request
        xhr.open(type, uri, true);

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

        // append data to URI on GET request
        if (type === 'GET' && data) {
            uri += data;
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

    // get request
    sh.network.get = function(uri, settings) {
        return this.request('GET', uri, settings);
    };

    // post request
    sh.network.post = function(uri, settings) {
        return this.request('POST', uri, settings);
    };

    // upload a file to ip
    sh.network.upload = function(ip, file, settings) {
        // defaults settings
        settings = settings || {};

        // file type
        if (file instanceof File) {
            file = {
                name: file.name,
                data: file
            }
        }

        // set file data
        settings.data = file.data;

        // set file name header
        settings.headers = {'X-Filename': file.name};

        // send the command as post request
        return this.post('http://' + ip + '/upload', settings);
    };

    // post command to ip
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
                var response = { raw : raw, data: data };

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
    // command namespace
    // http://smoothieware.org/console-commands
    // -------------------------------------------------------------------------
    sh.command = {};

    // list the files in the folder passed as a parameter ( can be absolute or relative ).
    sh.command.ls = function(ip, path, settings) {
        // defaults settings
        settings = settings || {};

        // default filename filter callback
        settings.filter = settings.filter  || null;

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            // split file on new line
            var files = raw.trim().split('\n');

            // filter files
            if (settings.filter) {
                files = files.filter(settings.filter);
            }

            // extract file name/size
            return files.map(function(value) {
                value = value.split(' ');
                return {
                    path: path,
                    name: value[0],
                    size: value[1]
                }
            });
        };

        // send the command
        sh.network.command(ip, 'ls -s ' + path, settings);
    };

    // get the content of the file given as a parameter to the standard output
    // ( limited to number of limit lines if that parameter is passed ).
    sh.command.cat = function(ip, path, settings) {
        // defaults settings
        settings = settings || {};

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            return { lines: raw.split('\n') };
        };

        // set limit if requested
        var limit = settings.limit ? (' ' + settings.limit) : '';

        // send the comand
        sh.network.command(ip, 'cat ' + path + limit, settings);
    };

    // get the board/firmware version
    sh.command.version = function(ip, settings) {
        // defaults settings
        settings = settings || {};

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
        };

        // send the comand
        sh.network.command(ip, 'version', settings);
    };

    // get information about RAM usage.
    sh.command.mem = function(ip, settings) {
        // defaults settings
        settings = settings || {};

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            // split response text on new lines
            return { lines: raw.trim().split('\n') };
        };

        // send the comand
        sh.network.command(ip, 'mem ', settings);
    };

    // -------------------------------------------------------------------------
    // export global namespace
    // -------------------------------------------------------------------------
    global.smoothieHappy = sh;

}(window);
