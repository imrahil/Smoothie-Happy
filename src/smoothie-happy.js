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
        timeout: 2000
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

    // post command to ip
    sh.network.command = function(ip, command, settings) {
        // defaults settings
        settings = settings || {};

        // set the command as request data
        settings.data = command.trim() + '\n';

        // send the command as post request
        return this.post('http://' + ip + '/command', settings);
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

    // -------------------------------------------------------------------------
    // command namespace
    // http://smoothieware.org/console-commands
    // -------------------------------------------------------------------------
    sh.command = {};

    // list the files in the folder passed as a parameter ( can be absolute or relative ).
    sh.command.ls = function(ip, path, settings) {
        // defaults settings
        settings = settings || {};

        settings.onfiles = settings.onfiles || null;
        settings.filter  = settings.filter  || null;

        // user on load callback
        var onload = settings.onload || function() {};

        // internal onload callback
        settings.onload = function(event) {
            // split file on new line
            var files = this.responseText.split('\n');

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

            // call user callbacks
            onload.call(this, event);

            if (settings.onfiles) {
                settings.onfiles.call(this, files);
            }
        };

        // send the command
        sh.network.command(ip, 'ls -s ' + path, settings);
    };

    // get the content of the file given as a parameter to the standard output
    // ( limited to number of limit lines if that parameter is passed ).
    sh.command.cat = function(ip, path, settings) {
        // defaults settings
        settings = settings || {};

        settings.ontext  = settings.ontext  || null;
        settings.onlines = settings.onlines || null;

        // user on load callback
        var onload = settings.onload || function() {};

        // internal onload callback
        settings.onload = function(event) {
            // response text
            var text = this.responseText;

            // call user callbacks
            onload.call(this, event);

            if (settings.ontext) {
                settings.ontext.call(this, text);
            }

            if (settings.onlines) {
                settings.onlines.call(this, text.split('\n'));
            }
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

        settings.onversion = settings.onversion || null;

        // user on load callback
        var onload = settings.onload || function() {};

        // internal onload callback
        settings.onload = function(event) {
            // raw version string
            var raw = this.responseText;

            // call user callbacks
            onload.call(this, event);

            if (settings.onversion) {
                // version pattern
                // expected : Build version: edge-94de12c, Build date: Oct 28 2014 13:24:47, MCU: LPC1769, System Clock: 120MHz
                var pattern = /Build version: (.*), Build date: (.*), MCU: (.*), System Clock: (.*)/;

                // test the pattern
                var matches = raw.match(pattern);

                if (matches) {
                    var branch  = matches[1].split('-');

                    settings.onversion.call(this, {
                        branch  : branch[0],
                        hash    : branch[1],
                        date    : matches[2],
                        mcu     : matches[3],
                        clock   : matches[4],
                        raw     : raw
                    });
                }
            }
        }

        // send the comand
        sh.network.command(ip, 'version', settings);
    };

    // -------------------------------------------------------------------------
    // export global namespace
    // -------------------------------------------------------------------------
    global.smoothieHappy = sh;

}(window);
