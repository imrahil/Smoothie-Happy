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
      * @param  {Object}  settings  See "{@link sh.network.request}.settings".
      * @return {XMLHttpRequest}
      */
    sh.network.get = function(url, settings) {
        return this.request('GET', url, settings);
    };

    /**
      * POST request.
      * @method sh.network.post
      * @param  {String}  url       URL with protocol.
      * @param  {Object}  settings  See "{@link sh.network.request}.settings".
      * @return {XMLHttpRequest}
      */
    sh.network.post = function(url, settings) {
        return this.request('POST', url, settings);
    };

    /**
      * Upload a file on the sd card.
      * @method sh.network.upload
      * @param  {String}       ip        Board ip.
      * @param  {Object|File}  file      {File} object or an {Object} with "name" and "data" properties set.
      * @param  {Object}       settings  See "{@link sh.network.request}.settings".
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
      * @param  {String}                       ip                   Board ip.
      * @param  {String}                       command              The command string. See {@link http://smoothieware.org/console-commands} for a complete list.
      * @param  {Object}                       settings             See "{@link sh.network.request}.settings".
      * @param  {sh.network.responseCallback}  settings.onresponse  Function called when the response is received.
      * @param  {sh.network.parserCallback}    settings.parser      Function that parses the response.
      * @return {XMLHttpRequest}
      */
    sh.network.command = function(ip, command, settings) {
        // defaults settings
        settings = settings || {};

        // default callbacks
        settings.onresponse = settings.onresponse || function() {};
        settings.parser     = settings.parser     || function(responseText) {
            return responseText.trim().split('\n');
        };

        // internal onload callback
        settings.onload = function(event) {
            // parse the response
            var result = settings.parser.call(this, this.responseText);

            // response object
            var response = { error: null, result: result };

            // result type check
            if (typeof result !== 'object') {
                if (typeof result === 'string') {
                    // error message provided
                    response.error  = result.trim();
                    response.result = null;
                }
                else if (result !== true) {
                    // unknown error message
                    response.error = 'Unknown error';
                    response.result = null;
                }
            }

            // call user callbacks
            settings.onresponse.call(this, response);
        };

        // set the command as request data
        settings.data = command.trim() + '\n';

        // send the command as post request
        return this.post('http://' + ip + '/command', settings);
    };

    /**
      * Callback called by {@link sh.network.command} that parses the raw response.
      * @callback sh.network.parserCallback
      * @param    {String} responseText The raw response text provided by the {XMLHttpRequest}
      * @return   {Mixed}  The response parsed as an object or TRUE if no data. FALSE if an error occure.
      */

    /**
     * Callback called by {@link sh.network.command} when the response is parsed.
     * @callback sh.network.responseCallback
     * @param    {Object} response Arbitrary object that represents the response.
     */

    /**
      * Wait until the board is online.
      * @method sh.network.waitUntilOnline
      * @param  {String}                     ip                 Board ip.
      * @param  {Object}                     settings           See "{@link sh.network.command}.settings".
      * @param  {Integer}                    settings.limit     Maximum number of trials {@default 10}.
      * @param  {Integer}                    settings.interval  Interval between trials in milliseconds {@default 2000}.
      * @param  {sh.network.onlineCallback}  settings.online    Called when the board is online.
      * @param  {sh.network.ontryCallback}   settings.ontry     Called when we try to connect with the board.
      * @return {XMLHttpRequest}
      */
    sh.network.waitUntilOnline = function(ip, settings) {
        // defaults settings
        settings = settings || {};

        // request timeout
        settings.timeout = settings.timeout || 1000;

        // trials limit
        settings.limit = settings.limit || 10;

        // interval between trials
        settings.interval = settings.interval || 2000;

        // online callback
        settings.online = settings.online || null;

        // ontry callback
        settings.ontry = settings.ontry || null;

        // user callbacks
        var ontimeout  = settings.ontimeout  || null;
        var onresponse = settings.onresponse || null;

        // trials counter
        settings.trials = settings.trials || 1;

        // on connection timeout
        settings.ontimeout = settings.onerror = function() {
            // increment trials counter
            settings.trials++;

            // if limit is reached
            if (settings.trials > settings.limit) {
                ontimeout.call(this);
                return;
            }

            // delay next try
            setTimeout(function() {
                sh.network.waitUntilOnline(ip, settings);
            }, settings.interval);
        };

        // on response
        settings.onresponse = function(response) {
            // call default user callback
            if (onresponse) {
                onresponse.call(this, response);
                onresponse = null;
            }

            // if online callback defined and version data
            if (settings.online && response.result.branch) {
                settings.online.call(this, response.result);
                settings.online = null;
            }
        };

        // send version command
        var xhr = sh.command.version(ip, settings);

        // on try callback ?
        if (settings.ontry) {
            settings.ontry.call(xhr, settings.trials);
        }

        // return the request Object
        return xhr;
    };

   /**
     * Callback called by {@link sh.network.waitUntilOnline} when the board is online.
     * @callback sh.network.onlineCallback
     * @param    {Object} board Board info (result of version cmd).
     */

   /**
     * Callback called by {@link sh.network.waitUntilOnline} when we try to connect with the board.
     * @callback sh.network.ontryCallback
     * @param    {Integer} trials Number of trials.
     */

    // -------------------------------------------------------------------------

    /**
      * Command module.
      * @namespace
      * @see http://smoothieware.org/console-commands
      */
    sh.command = {};

    /**
      * List the files in the folder passed as a parameter.
      * @method sh.command.ls
      * @param  {String}    ip               Board ip.
      * @param  {String}    path             Path to list, can be absolute or relative.
      * @param  {Object}    settings         See "{@link sh.network.command}.settings".
      * @param  {Callback}  settings.filter  Function to filter the files list.
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
            return files;
        };

        // send the command
        return sh.network.command(ip, command, settings);
    };

    /**
      * Change the current folder to the folder passed as a parameter.
      * @method sh.command.cd
      * @param  {String}  ip        Board ip.
      * @param  {String}  path      Path to folder, can be absolute or relative.
      * @param  {Object}  settings  See "{@link sh.network.command}.settings".
      * @return {XMLHttpRequest}
      */
    sh.command.cd = function(ip, path, settings) {
        // defaults settings
        settings = settings || {};

        // set the command
        var command = 'cd ' + path;

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            // error
            var message = raw.trim();

            if (message.length) {
                return message;
            }

            return { message: message };
        };

        // send the comand
        return sh.network.command(ip, command, settings);
    };

    /**
      * Shows the current folder.
      * @method sh.command.pwd
      * @param  {String}  ip        Board ip.
      * @param  {Object}  settings  See "{@link sh.network.command}.settings".
      * @return {XMLHttpRequest}
      */
    sh.command.pwd = function(ip, settings) {
        // defaults settings
        settings = settings || {};

        // set the command
        var command = 'pwd';

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            return { directory: raw.trim() };
        };

        // send the comand
        return sh.network.command(ip, command, settings);
    };

    /**
      * Get the content of the file given as a parameter.
      * @method sh.command.cat
      * @param  {String}   ip              Board ip.
      * @param  {String}   path            Path to file, can be absolute or relative.
      * @param  {Object}   settings        See "{@link sh.network.command}.settings".
      * @param  {Integer}  settings.limit  Limit the returned number of lines.
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

            return raw.split('\n');
        };

        // send the comand
        return sh.network.command(ip, command, settings);
    };

    /**
      * Remove a file.
      * @method sh.command.rm
      * @param  {String}  ip        Board ip.
      * @param  {String}  path      Path to file to remove.
      * @param  {Object}  settings  See "{@link sh.network.command}.settings".
      * @return {XMLHttpRequest}
      */
    sh.command.rm = function(ip, path, settings) {
        // defaults settings
        settings = settings || {};

        // set the command
        var command = 'rm ' + path;

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            // error
            if (raw.indexOf('Could not delete') === 0) {
                return raw;
            }

            return { message: 'removed' };
        };

        // send the comand
        return sh.network.command(ip, command, settings);
    };

    /**
      * Move a file.
      * @method sh.command.mv
      * @param  {String}  ip        Board ip.
      * @param  {String}  path      Path to file source.
      * @param  {String}  newpath   Path to file destination.
      * @param  {Object}  settings  See "{@link sh.network.command}.settings".
      * @return {XMLHttpRequest}
      */
    sh.command.mv = function(ip, path, newpath, settings) {
        // defaults settings
        settings = settings || {};

        // set the command
        var command = 'mv ' + path + ' ' + newpath;

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            // error
            if (raw.indexOf('Could not rename') === 0) {
                return raw;
            }

            return { message: raw.trim() };
        };

        // send the comand
        return sh.network.command(ip, command, settings);
    };

    /**
      * Alias of {@link sh.network.upload}.
      * Upload a file on the sd card.
      * @method sh.command.upload
      * @param  {String}       ip        Board ip.
      * @param  {Object|File}  file      {File} object or an {Object} with "name" and "data" properties set.
      * @param  {Object}       settings  See "{@link sh.network.request}.settings".
      * @return {XMLHttpRequest}
      */
    sh.command.upload = function(ip, file, settings) {
        return sh.network.upload(ip, file, settings);
    };

    /**
      * Reset the system.
      * @method sh.command.reset
      * @param  {String}   ip                        Board ip.
      * @param  {Object}   settings                  See "{@link sh.network.command}.settings".
      * @param  {Integer}  settings.resetDelay       Delay before the smoothie reset (@default: 5000).
      * @param  {Object}   settings.waitUntilOnline  See "{@link sh.network.waitUntilOnline}.settings".
      * @return {XMLHttpRequest}
      */
    sh.command.reset = function(ip, settings) {
        // defaults settings
        settings = settings || {};

        // set the command
        var command = 'reset';

        // delay before the smoothie reset (default: 5 seconds)
        // https://github.com/Smoothieware/Smoothieware/blob/100e5055156f7fbe9f7b57fccdc4bfd0784bc728/src/modules/utils/simpleshell/SimpleShell.cpp#L620
        settings.resetDelay = settings.resetDelay || 5000;

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            if (settings.waitUntilOnline) {
                setTimeout(function() {
                    sh.network.waitUntilOnline(ip, settings.waitUntilOnline);
                }, settings.resetDelay + 1000);
            }

            return { message: raw.trim() };
        };

        // send the comand
        return sh.network.command(ip, command, settings);
    };

    /**
      * Get config value.
      * @method sh.command.configGet
      * @param  {String}  ip                 Board ip.
      * @param  {String}  name               Setting name.
      * @param  {Object}  settings           See "{@link sh.network.command}.settings".
      * @param  {String}  settings.location  Where to read the value {@default 'sd'}.
      * @return {XMLHttpRequest}
      */
    sh.command.configGet = function(ip, name, settings) {
        // defaults settings
        settings = settings || {};

        // set config location
        var location = settings.location || 'sd';

        if (location.length) {
            location = location + ' ';
        }

        // set the command
        var command = 'config-get ' + location + name;

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            raw = raw.trim();

            if (raw.indexOf('is not in config') !== -1) {
                return raw;
            }

            if (raw.length) {
                return { value: raw.split(' ').pop() };
            }

            return 'invalid location';
        };

        // send the comand
        return sh.network.command(ip, command, settings);
    };

    /**
      * Set config value.
      * @method sh.command.configSet
      * @param  {String}  ip                 Board ip.
      * @param  {String}  name               Setting name.
      * @param  {String}  value              Setting value.
      * @param  {Object}  settings           See "{@link sh.network.command}.settings".
      * @param  {String}  settings.location  Where to write the value {@default 'sd'}.
      * @return {XMLHttpRequest}
      */
    sh.command.configSet = function(ip, name, value, settings) {
        // defaults settings
        settings = settings || {};

        // set config location
        var location = settings.location || 'sd';

        if (location.length) {
            location = location + ' ';
        }

        // set the command
        var command = 'config-set ' + location + name + ' ' + value;

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            raw = raw.trim();

            if (raw.indexOf('not enough space to overwrite existing key/value') !== -1) {
                return raw;
            }

            if (raw.length) {
                return { value: raw.split(' ').pop() };
            }

            return 'invalid location';
        };

        // send the comand
        return sh.network.command(ip, command, settings);
    };

    /**
      * Get configuration from file.
      * @method sh.command.configFile
      * @param  {String}  ip                 Board ip.
      * @param  {Object}  settings           See "{@link sh.network.command}.settings".
      * @param  {Mixed}   settings.timeout   Connexion timeout {@default 60000}.
      * @param  {Mixed}   settings.filename  Configuration filename relative to sd card root directory {@default 'config.txt'}.
      * @return {XMLHttpRequest}
      */
    sh.command.configFile = function(ip, settings) {

        // defaults settings
        settings = settings || {};

        // set default timeout to 60s
        settings.timeout = settings.timeout || 60000;

        // set default filename
        var filename = settings.filename || 'config.txt';

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            // split response text on new lines
            var lines = raw.trim().split('\n');

            // extract sections
            var line, section, matches, name, value, disabled, comments;
            var sections = [], items = {};

            for (var i = 0, il = lines.length; i < il; i++) {
                // current line
                line = lines[i];

                // section comments
                if (line[0] === '#' && line[1] === ' ') {
                    // first line
                    if (! section) {
                        section = {
                            comments : [],
                            items    : {},
                            maxLength: {
                                name : 0,
                                value: 0
                            }
                        };
                    }

                    // push comment line
                    section.comments.push(line.substr(2).trim());
                    continue;
                }

                // end of file or section
                if (i == il - 1 || (lines[i + 1][0] === '#' && lines[i + 1][1] === ' ')) {
                    sections.push(section);
                    section = null;
                    continue;
                }

                // item comment, append to last item comment
                if (name && line[0] === ' ') {
                    var item = section.items[name];
                    item.comments.push(line.trim().replace(/^# */, ''));
                    continue;
                }

                // disabled item (commented)
                disabled = line[0] === '#';

                if (disabled) {
                    line = line.substr(1);
                }

                // extracts [name, value, comment]
                matches = line.trim().match(/([^ ]+) +([^ ]+) *(.*)?/);

                if (matches) {
                    name     = matches[1];
                    value    = matches[2];
                    comments = matches[3] ? matches[3].substr(1).trim() : '';

                    section.items[name] = {
                        name    : name,
                        value   : value,
                        disabled: disabled,
                        comments: [comments]
                    };

                    items[name] = sections.length;

                    section.maxLength.name  = Math.max(section.maxLength.name , name.length);
                    section.maxLength.value = Math.max(section.maxLength.value, value.length);
                }

            }

            // return result
            return {
                sections: sections,
                lines   : lines,
                items   : items,
                get     : function(name) {
                    if (items[name] === undefined
                    || sections[items[name]] === undefined
                    || sections[items[name]].items[name] === undefined) {
                        return null;
                    }
                    return sections[items[name]].items[name];
                }
            };
        };

        // send the command
        return sh.command.cat(ip, '/sd/' + filename, settings);
    };

    /**
      * Set/Get configuration.
      * @method sh.command.config
      * @param  {String}  ip        Board ip.
      * @param  {String}  [name]    Setting name.
      * @param  {String}  [value]   Setting value.
      * @param  {Object}  settings  See "{@link sh.network.command}.settings".
      * @return {XMLHttpRequest}
      */
    sh.command.config = function(ip, name, value, settings) {
        var args   = Array.prototype.slice.call(arguments);
        var method = 'configFile';

        if (args.length > 2) {
            var method = args.length > 3 ? 'configSet' : 'configGet';
        }

        return sh.command[method].apply(this, args);
    };

    /**
      * Saves a configuration override file as specified filename or as config-override.
      * @method sh.command.configOverrideSave
      * @param  {String}  ip          Board ip.
      * @param  {String}  [filename]  Target config-override filename.
      * @param  {Object}  settings    See "{@link sh.network.command}.settings".
      * @return {XMLHttpRequest}
      */
    sh.command.configOverrideSave = function(ip, filename, settings) {
        if (arguments.length === 2) {
            settings = filename;
            filename = '/';
        }

        // defaults settings
        settings = settings || {};

        // set the command
        var command = 'save ' + filename;

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            return { message: raw.trim() };
        };

        // send the command
        return sh.network.command(ip, command, settings);
    };

    /**
      * loads a configuration override file from specified name or config-override.
      * @method sh.command.configOverrideLoad
      * @param  {String}  ip          Board ip.
      * @param  {String}  [filename]  Target config-override filename.
      * @param  {Object}  settings    See "{@link sh.network.command}.settings".
      * @return {XMLHttpRequest}
      */
    sh.command.configOverrideLoad = function(ip, filename, settings) {
        if (arguments.length === 2) {
            settings = filename;
            filename = '/';
        }

        // defaults settings
        settings = settings || {};

        // set the command
        var command = 'load ' + filename;

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            raw = raw.trim();

            if (raw.indexOf('File not found') === 0) {
                return raw;
            }

            var lines   = raw.split('\n');
            var message = lines.shift() + ' ' + lines.pop() + '.';

            return { message: message, lines: lines };
        };

        // send the command
        return sh.network.command(ip, command, settings);
    };

    /**
      * Load/unload/dump configuration cache.
      * @method sh.command.configCache
      * @param  {String}  ip        Board ip.
      * @param  {String}  action    Possible values [load|unload|dump].
      * @param  {Object}  settings  See "{@link sh.network.command}.settings".
      * @return {XMLHttpRequest}
      */
    sh.command.configCache = function(ip, action, settings) {
        // defaults settings
        settings = settings || {};

        if (action === 'dump') {
            // set default timeout to 60s
            settings.timeout = settings.timeout || 60000;
        }

        // set the command
        var command = 'config-load ' + action;

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            raw = raw.trim();

            if (raw.indexOf('unsupported option') === 0 || action === 'checksum') {
                return 'unsupported option: must be one of load|unload|dump';
            }

            if (action === 'load' || action === 'unload') {
                return { message: raw };
            }

            return { lines: raw.split('\n') };
        };

        // send the comand
        return sh.network.command(ip, command, settings);
    };

    /**
      * Load configuration cache.
      * @method sh.command.configCacheLoad
      * @param  {String}  ip        Board ip.
      * @param  {Object}  settings  See "{@link sh.network.command}.settings".
      * @return {XMLHttpRequest}
      */
    sh.command.configCacheLoad = function(ip, settings) {
        return sh.command.configCache(ip, 'load', settings);
    };

    /**
      * Unload configuration cache.
      * @method sh.command.configCacheUnload
      * @param  {String}  ip        Board ip.
      * @param  {Object}  settings  See "{@link sh.network.command}.settings".
      * @return {XMLHttpRequest}
      */
    sh.command.configCacheUnload = function(ip, settings) {
        return sh.command.configCache(ip, 'unload', settings);
    };

    /**
      * Dump configuration cache.
      * @method sh.command.configCacheDump
      * @param  {String}  ip        Board ip.
      * @param  {Object}  settings  See "{@link sh.network.command}.settings".
      * @return {XMLHttpRequest}
      */
    sh.command.configCacheDump = function(ip, settings) {
        return sh.command.configCache(ip, 'dump', settings);
    };

    /**
      * Get the input value checksum.
      * @method sh.command.checksum
      * @param  {String}  ip        Board ip.
      * @param  {String}  input     Input value to get checksum.
      * @param  {Object}  settings  See "{@link sh.network.command}.settings".
      * @return {XMLHttpRequest}
      */
    sh.command.checksum = function(ip, input, settings) {
        // defaults settings
        settings = settings || {};

        // set the command
        var command = 'config-load checksum ' + input;

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            raw = raw.trim();

            var checksum = raw.split('=').pop().trim();

            return { checksum: checksum };
        };

        // send the comand
        return sh.network.command(ip, command, settings);
    };

    /**
      * Get a list of commands.
      * @method sh.command.help
      * @param  {String}  ip        Board ip.
      * @param  {Object}  settings  See "{@link sh.network.command}.settings".
      * @return {XMLHttpRequest}
      */
    sh.command.help = function(ip, settings) {
        // defaults settings
        settings = settings || {};

        // set the command
        var command = 'help';

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            // split response text on new lines
            var lines = raw.trim().split('\n');

            // remove first line ('Commands:')
            lines.shift();

            // return commands list
            return lines;
        };

        // send the comand
        return sh.network.command(ip, command, settings);
    };

    /**
      * Get the board/firmware version.
      * @method sh.command.version
      * @param  {String}  ip        Board ip.
      * @param  {Object}  settings  See "{@link sh.network.command}.settings".
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
        return sh.network.command(ip, command, settings);
    };

    /**
      * Get information about RAM usage.
      * @method sh.command.mem
      * @param  {String}  ip        Board ip.
      * @param  {Object}  settings  See "{@link sh.network.command}.settings".
      * @return {XMLHttpRequest}
      */
    sh.command.mem = function(ip, settings) {
        // defaults settings
        settings = settings || {};

        // set verbosity
        var verbose = settings.verbose ? ' -v' : '';

        // set the command
        var command = 'mem' + verbose;

        // send the comand
        return sh.network.command(ip, command, settings);
    };

    /**
      * Get [temp|pos|wcs|state|status|fk|ik].
      * @method sh.command.get
      * @param  {String} ip        Board ip.
      * @param  {String} what      Possible value [temp|pos|wcs|state|status|fk|ik].
      * @param  {Mixed}  settings  See "{@link sh.network.command}.settings".
      * @return {XMLHttpRequest}
      */
    sh.command.get = function(ip, what, settings) {
        return sh.network.command(ip, 'get ' + what, settings || {});
    };

    /**
      * Get current temperature.
      * @method sh.command.tempGet
      * @param  {String}  ip               Board ip.
      * @param  {Object}  settings         See "{@link sh.network.command}.settings".
      * @param  {Mixed}   settings.device  Possible values: [all, bed, hotend] {@default all}.
      * @return {XMLHttpRequest}
      */
    sh.command.tempGet = function(ip, settings) {
        // defaults settings
        settings = settings || {};

        // set default device
        var device = settings.device || 'all';
            device = device === 'all' ? '' : ' ' + device;

        // set the command
        var what = 'temp' + device;

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            raw = raw.trim();

            if (raw.indexOf('no heaters found') === 0) {
                return raw;
            }
            else if (raw.indexOf('is not a known temperature device') !== -1) {
                return raw;
            }

            // split response on new lines
            var lines = raw.split('\n');

            var i, il, line, temp, temps = [];

            for (i = 0, il = lines.length; i < il; i++) {
                line = lines[i].split(' ');

                // %s (%d) temp: %f/%f @%d
                // designator, id, current_temperature, target_temperature, pwm
                if (device === '') {
                    temp = line[3].split('/');
                    temps.push({
                        type      : line[0] === 'B' ? 'bed' : 'hotend',
                        designator: line[0],
                        id        : line[1].substr(1, line[1].length-2),
                        current   : parseFloat(temp[0] === 'inf' ? Infinity : temp[0]),
                        target    : parseFloat(temp[1]),
                        pwm       : parseFloat(line[4].substr(1))
                    });
                }
                // %s temp: %f/%f @%d
                // designator, id, current_temperature, target_temperature, pwm
                else {
                    temp  = line[2].split('/');
                    temps = {
                        type   : line[0],
                        current: parseFloat(temp[0] === 'inf' ? Infinity : temp[0]),
                        target : parseFloat(temp[1]),
                        pwm    : parseFloat(line[3].substr(1))
                    };
                }
            }

            return temps;
        };

        // send the comand
        return sh.command.get(ip, what, settings);
    };

    /**
      * Set temperature.
      * @method sh.command.tempSet
      * @param  {String}  ip        Board ip.
      * @param  {String}  device    Device [bed|hotend].
      * @param  {Integer} temp      Target tempertaure.
      * @param  {Object}  settings  See "{@link sh.network.command}.settings".
      * @return {XMLHttpRequest}
      */
    sh.command.tempSet = function(ip, device, temp, settings) {
        // defaults settings
        settings = settings || {};

        // set the command
        var command = 'set_temp ' + device + ' ' + temp;

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            raw = raw.trim();

            if (raw.indexOf('is not a known temperature device') !== -1) {
                return raw;
            }

            // return message
            return { message: raw };
        };

        // send the comand
        return sh.network.command(ip, command, settings);
    };

    /**
      * Set/Get temperature.
      * @method sh.command.temp
      * @param  {String}  ip        Board ip.
      * @param  {String}  [device]  Device [bed|hotend].
      * @param  {Integer} [temp]    Target tempertaure.
      * @param  {Object}  settings  See "{@link sh.network.command}.settings".
      * @return {XMLHttpRequest}
      */
    sh.command.temp = function(ip, device, temp, settings) {
        var args   = Array.prototype.slice.call(arguments);
        var method = args.length > 2 ? 'tempSet' : 'tempGet';
        return sh.command[method].apply(this, args);
    };

    /**
      * Do forward or inverse kinematics on the given cartesian position,
      * optionally moves the actuators and finaly display the coordinates.
      * @method sh.command.kinematics
      * @param  {String}   ip                Board ip.
      * @param  {Object}   settings          See "{@link sh.network.command}.settings".
      * @param  {Boolean}  settings.move     Move to the calculated or given XYZ coords {@default false}.
      * @param  {Boolean}  settings.inverse  Do inverse kinematics {@default false}.
      * @return {XMLHttpRequest}
      */
    sh.command.kinematics = function(ip, settings) {
        // defaults settings
        settings = settings || {};

        // inverse or forward
        var type = settings.inverse ? 'ik' : 'fk';

        // move to the calculated or given XYZ coords ?
        var move = settings.move ? ' -m' : '';

        // positions
        var position = settings.position || 0;

        // set coords
        var x, y, z;

        if (typeof position !== 'object') {
            x = y = z = parseFloat(position);
        }
        else {
            x = position.x || 0;
            y = position.y || x;
            z = position.z || y;
        }

        // set the command
        var what = type + move + ' ' + x + ',' + y + ',' + z;

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            raw = raw.trim();

            if (raw.indexOf('error:') === 0) {
                return raw.substr(6);
            }

            if (type === 'ik') {
                var pattern = /(.*)= A (.*), B (.*), C (.*)/;
            }
            else {
                var pattern = /(.*)= X (.*), Y (.*), Z (.*), Steps= A (.*), B (.*), C (.*)/;
            }

            var matches = raw.match(pattern);

            if (matches) {
                if (type == 'ik') {
                    return {
                        type: matches[1],
                        coords: {
                            a: parseFloat(matches[2]),
                            b: parseFloat(matches[3]),
                            c: parseFloat(matches[4]),
                        }
                    }
                }

                return {
                    type: matches[1],
                    coords: {
                        x: parseFloat(matches[2]),
                        y: parseFloat(matches[3]),
                        z: parseFloat(matches[4]),
                    },
                    steps: {
                        a: parseFloat(matches[5]),
                        b: parseFloat(matches[6]),
                        c: parseFloat(matches[7]),
                    }
                }
            }

            return 'unknown error';
        };

        // send the comand
        return sh.command.get(ip, what, settings);
    };

    /**
      * Get current position.
      * @method sh.command.position
      * @param  {String}  ip        Board ip.
      * @param  {Object}  settings  See "{@link sh.network.command}.settings".
      * @return {XMLHttpRequest}
      */
    sh.command.position = function(ip, settings) {
        // defaults settings
        settings = settings || {};

        // set the command
        var what = 'pos';

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            raw = raw.trim();

            // split on new lines
            var lines = raw.split('\n');

            var i, il, line, key, positions = {};

            for (i = 0, il = lines.length; i < il; i++) {
                line = lines[i].split(':');
                key  = line.shift().replace(' ', '_').toLowerCase();
                line = line.join(':').trim().split(' ');

                positions[key] = {
                    x: parseFloat(line[0].substr(2)),
                    y: parseFloat(line[1].substr(2)),
                    z: parseFloat(line[2].substr(2))
                };
            }

            // split response text on new lines
            return positions;
        };

        // send the comand
        return sh.command.get(ip, what, settings);
    };

    /**
      * Get work coordinate system.
      * @method sh.command.wcs
      * @param  {String}  ip        Board ip.
      * @param  {Object}  settings  See "{@link sh.network.command}.settings".
      * @return {XMLHttpRequest}
      */
    sh.command.wcs = function(ip, settings) {
        // defaults settings
        settings = settings || {};

        // set the command
        var what = 'wcs';

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            raw = raw.trim();

            // split on new lines
            var lines = raw.split('\n');

            var i, il, line, key, wcs = {};

            // extract the first line as current wcs
            wcs.current = lines.shift().split(':').pop().replace(']', '').trim();

            for (i = 0, il = lines.length; i < il; i++) {
                line = lines[i].substr(1, lines[i].length - 2).split(/[:,]/);
                key  = line.shift();

                if (key === 'PRB') {
                    key = 'prob';
                }
                else if (key[0] !== 'G') {
                    key = key.replace(' ', '_').toLowerCase();
                }

                wcs[key] = {
                    x: parseFloat(line[0]),
                    y: parseFloat(line[1]),
                    z: parseFloat(line[2])
                };

                if (key === 'prob') {
                    wcs[key].ok = !!parseInt(line[3]);
                }
            }

            return wcs;
        };

        // send the comand
        return sh.command.get(ip, what, settings);
    };

    /**
      * Get system state.
      * @method sh.command.state
      * @param  {String}  ip        Board ip.
      * @param  {Object}  settings  See "{@link sh.network.command}.settings".
      * @return {XMLHttpRequest}
      */
    sh.command.state = function(ip, settings) {
        // defaults settings
        settings = settings || {};

        // set the command
        var what = 'state';

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            raw = raw.trim();

            // remove brackets and split on spaces
            var parts = raw.substr(1, raw.length - 2).split(' ');
            var state = {};

            // [G0 G54 G17 G21 G90 G94 M0 M5 M9 T0 F0.]
            state.move      = parts[0];
            state.rapid     = state.move === 'G0';
            state.arc_cw    = state.move === 'G2';
            state.arc_ccw   = state.move === 'G3';
            state.wcs       = parts[1];
            state.plane     = parts[2] === 'G17' ? 'XY' : (parts[2] === 'G18' ? 'ZX' : (parts[2] === 'G19' ? 'YZ' : '--'));
            state.units     = parts[3] === 'G20' ? 'in' : 'mm';
            state.mode      = parts[4] === 'G90' ? 'absolute' : 'relative';
            state.absolute  = state.mode === 'absolute';
            state.relative  = state.mode === 'relative';
            state.tool      = parseInt(parts[9].substr(1));
            state.feed_rate = parseFloat(parts[10].substr(1));

            return state;
        };

        // send the comand
        return sh.command.get(ip, what, settings);
    };

    /**
      * Get system status.
      * @method sh.command.status
      * @param  {String}  ip        Board ip.
      * @param  {Object}  settings  See "{@link sh.network.command}.settings".
      * @return {XMLHttpRequest}
      */
    sh.command.status = function(ip, settings) {
        // defaults settings
        settings = settings || {};

        // set the command
        var what = 'status';

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            raw = raw.trim();
            raw = raw.substr(1, raw.length - 2);
            raw = raw.replace('MPos:', '').replace('WPos:', '');

            var parts  = raw.split(',');
            var status = {
                state: parts[0],
                machine: {
                    x: parseFloat(parts[1]),
                    y: parseFloat(parts[2]),
                    z: parseFloat(parts[3]),
                },
                world: {
                    x: parseFloat(parts[4]),
                    y: parseFloat(parts[5]),
                    z: parseFloat(parts[6]),
                }
            };

            return status;
        };

        // send the comand
        return sh.command.get(ip, what, settings);
    };

    /**
      * Switch.
      * @method sh.command.switch
      * @param  {String}  ip        Board ip.
      * @param  {String}  device    Device ex.: 'fan' or 'misc'.
      * @param  {String}  value     State [on|off] or value.
      * @param  {Object}  settings  See "{@link sh.network.command}.settings".
      * @return {XMLHttpRequest}
      */
    sh.command.switch = function(ip, device, value, settings) {
        // defaults settings
        settings = settings || {};

        // set the command
        var command = 'switch ' + device + ' ' + value;

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            raw = raw.trim();

            if (raw.indexOf('is not a known switch device') !== -1) {
                return raw;
            }

            // return message
            return { message: raw };
        };

        // send the comand
        return sh.network.command(ip, command, settings);
    };

    /**
      * Get network config.
      * @method sh.command.net
      * @param  {String}  ip        Board ip.
      * @param  {Object}  settings  See "{@link sh.network.command}.settings".
      * @return {XMLHttpRequest}
      */
    sh.command.net = function(ip, settings) {
        // defaults settings
        settings = settings || {};

        // set the command
        var command = 'net';

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            raw = raw.trim();

            var matches = raw.match(/IP Addr:([^\n]+)\nIP GW:([^\n]+)\nIP mask:([^\n]+)\nMAC Address:([^\n]+)/);

            if (matches) {
                return {
                    ip     : matches[1].trim(),
                    gateway: matches[2].trim(),
                    mask   : matches[3].trim(),
                    mac    : matches[4].trim()
                }
            }

            // return message
            return { message: raw };
        };

        // send the comand
        return sh.network.command(ip, command, settings);
    };

    /**
      * Remount...
      * @method sh.command.remount
      * @param  {String}  ip        Board ip.
      * @param  {Object}  settings  See "{@link sh.network.command}.settings".
      * @return {XMLHttpRequest}
      */
    sh.command.remount = function(ip, settings) {
        // defaults settings
        settings = settings || {};

        // set the command
        var command = 'remount';

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            return { message: raw.trim() };
        };

        // send the comand
        return sh.network.command(ip, command, settings);
    };

    /**
      * Calculate the Steinhart Hart coefficients for a thermistor.
      * @method sh.command.thermistorCalc
      * @param  {String}                             ip                Board ip.
      * @param  {String}                             values            Thermistor values separated by commas 'T1,R1,T2,R2,T3,R3'.
      * @param  {Object}                             settings          See "{@link sh.network.command}.settings".
      * @param  {Integer}                            settings.storeto  Store the results to thermistor n.
      * @param  {Boolean}                            settings.save     Save the stored results to override-config (storeto must be set).
      * @param  {sh.command.thermistorSaveCallback}  settings.onsave   Called when the values was saved.
      * @return {XMLHttpRequest}
      */
    sh.command.thermistorCalc = function(ip, values, settings) {
        // defaults settings
        settings = settings || {};

        // store to thermistor n
        var storeto = '';

        if (settings.storeto || settings.storeto === 0) {
            storeto = '-s' + settings.storeto + ' ';
        }

        // set the command
        var command = 'calc_thermistor ' + storeto + values;

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            raw = raw.trim();

            if (raw.indexOf('Usage: calc_thermistor') === 0) {
                return raw;
            }

            var lines   = raw.split('\n');
            var result  = lines.shift().trim();
            var message = lines.shift().trim();
            var matches = result.match(/Steinhart Hart coefficients: *I(.*)J(.*)K(.*)/);

            if (matches) {
                var I = matches[1].trim();
                var J = matches[2].trim();
                var K = matches[3].trim();

                if (I === 'nan' || J === 'nan' || K === 'nan') {
                    return 'invalid input values';
                }

                result = { I: parseFloat(I), J: parseFloat(J), K: parseFloat(K) };
            }

            if (settings.save && storeto !== '') {
                sh.network.command(ip, 'M500', {
                    onresponse: function(response) {
                        if (settings.onsave) {
                            settings.onsave.call(this, response);
                        }
                    }
                });
            }

            return { message: message, result: result };
        };

        // send the comand
        return sh.network.command(ip, command, settings);
    };

    /**
      * Callback called by {@link sh.command.thermistorCalc} when the values was saved.
      * @callback sh.command.thermistorSaveCallback
      * @param    {Object} response The response object provided by the {@link sh.network.responseCallback}.
      */

    /**
     * Get the predefined thermistors.
     * @method sh.command.thermistors
     * @param  {String}  ip        Board ip.
     * @param  {Object}  settings  See "{@link sh.network.command}.settings".
     * @return {XMLHttpRequest}
     */
     sh.command.thermistors = function(ip, settings) {
         // defaults settings
         settings = settings || {};

         // set the command
         var command = 'thermistors';

         // default response parser callback
         settings.parser = settings.parser || function(raw) {
             var lines   = raw.split('\n');
             var result  = { table: {}, beta: {} };
             var pointer = result.table;

             var i, il, line, matches, name, value;

             for (i = 0, il = lines.length; i < il; i++) {
                 line    = lines[i].trim();
                 matches = line.match(/^([0-9]+) - (.*)/);

                 if (line.indexOf('Beta table') !== -1) {
                     pointer = result.beta;
                     continue;
                 }

                 if (matches) {
                     name  = matches[2].trim();
                     value = parseFloat(matches[1].trim());

                     pointer[name] = value;
                 }
             }

             return result;
         };

         // send the comand
         return sh.network.command(ip, command, settings);
     };

    /**
     * Get md5 sum of the given file.
     * @method sh.command.md5sum
     * @param  {String}  ip        Board ip.
     * @param  {String}  path      Relative or absolute path to file.
     * @param  {Object}  settings  See "{@link sh.network.command}.settings".
     * @return {XMLHttpRequest}
     */
     sh.command.md5sum = function(ip, path, settings) {
         // defaults settings
         settings = settings || {};

         // set the command
         var command = 'md5sum ' + path;

         // default response parser callback
         settings.parser = settings.parser || function(raw) {
             raw = raw.trim();

             if (raw.indexOf('File not found') !== -1) {
                 return raw;
             }

             var parts = raw.split(' ');

             return {
                 md5 : parts.shift().trim(),
                 file: parts.shift().trim()
             };
         };

         // send the comand
         return sh.network.command(ip, command, settings);
     };

    /**
     * Play a gcode file.
     * @method sh.command.play
     * @param  {String}   ip                Board ip.
     * @param  {String}   path              Relative or absolute path to file.
     * @param  {Object}   settings          See "{@link sh.network.command}.settings".
     * @param  {Boolean}  settings.verbose  Verbose output {@default false}.
     * @return {XMLHttpRequest}
     */
     sh.command.play = function(ip, path, settings) {
         // defaults settings
         settings = settings || {};

         var verbose = settings.verbose ? ' -v' : '';

         // set the command
         var command = 'play ' + path + verbose;

         // default response parser callback
         settings.parser = settings.parser || function(raw) {
             raw = raw.trim();

             if (! raw.length) {
                 return 'Alarm';
             }

             if (raw.indexOf('File not found') !== -1) {
                 return raw;
             }

             if (raw.indexOf('Currently printing') !== -1) {
                 return raw;
             }

             var lines = raw.split('\n');
             var file  = lines.shift().split(' ').pop().trim();
             var size  = -1;

             if (raw.indexOf('WARNING') === -1) {
                 size = parseFloat(lines.shift().split(' ').pop().trim());
             }

             return { file: file, size: size };
         };

         // send the comand
         return sh.network.command(ip, command, settings);
     };

    /**
     * Get progress of current play.
     * @method sh.command.progress
     * @param  {String}   ip        Board ip.
     * @param  {Object}   settings  See "{@link sh.network.command}.settings".
     * @return {XMLHttpRequest}
     */
    sh.command.progress = function(ip, settings) {
        // defaults settings
        settings = settings || {};

        // set the command
        var command = 'progress';

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            raw = raw.trim();

            if (! raw.length) {
                return 'Alarm';
            }

            if (raw.indexOf('Not currently playing') !== -1) {
                return raw;
            }

            if (raw.indexOf('File size is unknown') !== -1) {
                return raw;
            }

            if (raw.indexOf('SD print is paused at') !== -1) {
                var parts = raw.split(' ');

                return {
                    paused: true,
                    total : parseFloat(parts.pop().trim()),
                    played: parseFloat(parts.pop().trim())
                };
            }

            // file: %s, %u %% complete, elapsed time: %lu s, est time: %lu s
            if (raw.indexOf('file:') === 0) {
                var parts = raw.split(' ');

                return {
                    paused  : false,
                    file    : parts[2].substr(0, parts[2].length - 2),
                    complete: parseFloat(parts[3]),
                    elapsed : parseFloat(parts[8]),
                    esteemed: parts[12] ? parseFloat(parts[12]) : Infinity,
                };
            }
        };

        // send the comand
        return sh.network.command(ip, command, settings);
    };

    /**
     * Abort currently playing file.
     * @method sh.command.abort
     * @param  {String}   ip        Board ip.
     * @param  {Object}   settings  See "{@link sh.network.command}.settings".
     * @return {XMLHttpRequest}
     */
    sh.command.abort = function(ip, settings) {
        // defaults settings
        settings = settings || {};

        // set the command
        var command = 'abort';

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            raw = raw.trim();

            if (! raw.length) {
                return 'Alarm';
            }

            if (raw.indexOf('Not currently playing') !== -1) {
                return raw;
            }

            return { message: raw };
        };

        // send the comand
        return sh.network.command(ip, command, settings);
   };

    /**
    * Suspend a print in progress.
    * @method sh.command.suspend
    * @param  {String}   ip        Board ip.
    * @param  {Object}   settings  See "{@link sh.network.command}.settings".
    * @return {XMLHttpRequest}
    */
    sh.command.suspend = function(ip, settings) {
        // defaults settings
        settings = settings || {};

        // set the command
        var command = 'suspend';

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
           raw = raw.trim();

           if (! raw.length) {
               return 'Alarm';
           }

           if (raw.indexOf('Already suspended') !== -1) {
               return raw;
           }

           return { message: raw };
        };

        // send the comand
        return sh.network.command(ip, command, settings);
    };

  /**
   * Resume the suspended print.
   * @method sh.command.resume
   * @param  {String}   ip        Board ip.
   * @param  {Object}   settings  See "{@link sh.network.command}.settings".
   * @return {XMLHttpRequest}
   */
  sh.command.resume = function(ip, settings) {
      // defaults settings
      settings = settings || {};

      // set the command
      var command = 'resume';

      // default response parser callback
      settings.parser = settings.parser || function(raw) {
          raw = raw.trim();

          if (! raw.length) {
              return 'Alarm';
          }

          if (raw.indexOf('Not suspended') !== -1) {
              return raw;
          }

          if (raw.indexOf('Resume aborted by kill') !== -1) {
              return 'Resume aborted by kill';
          }

          var lines = raw.split('\n');

          // TODO: parse response
          // REF: https://github.com/Smoothieware/Smoothieware/blob/8cbd981e85c918e059a6e68d70fbf3cdad0f8ca5/src/modules/utils/player/Player.cpp#L614

          return { lines: lines };
      };

      // send the comand
      return sh.network.command(ip, command, settings);
 };

    /**
    * Reset alarm.
    * @method sh.command.resetAlarm
    * @param  {String}   ip        Board ip.
    * @param  {Object}   settings  See "{@link sh.network.command}.settings".
    * @return {XMLHttpRequest}
    */
    sh.command.resetAlarm = function(ip, settings) {
        // defaults settings
        settings = settings || {};

        // set the command
        var command = '$X';

        // default response parser callback
        settings.parser = settings.parser || function(raw) {
            return { message: 'unlocked' };
        };

        // send the comand
        return sh.network.command(ip, command, settings);
    };

})();
