(function () {
    'use strict';

    /**
    * Send a command to the board.
    *
    * @method
    *
    * @param {String}  command Command to send.
    * @param {Integer} [timeout] Response timeout.
    *
    * @return {sh.network.Request}
    *
    * {$examples sh.Board.command}
    */
    sh.Board.prototype.command = function(command, timeout) {
        // default response timeout
        if (timeout === undefined) {
            timeout = this.timeout;
        }

        // self alias
        var self = this;

        // return POST request (promise)
        return sh.network.post({
            url    : 'http://' + this.address + '/command',
            data   : command.trim() + '\n',
            timeout: timeout
        })
        .then(function(event) {
            // set online flag
            self.online = true;

            // set last online time
            self.lastOnlineTime = Date.now();

            // resolve the promise
            return Promise.resolve(self._trigger('response', event));
        })
        .catch(function(event) {
            // unset online flag
            self.online = false;

            // reject the promise
            return Promise.reject(self._trigger('error', event));
        });
    };

    /**
    * Send ping command (ok).
    *
    * @method
    *
    * @param {Integer} [timeout] Response timeout.
    *
    * @return {sh.network.Request}
    *
    * {$examples sh.Board.ping}
    */
    sh.Board.prototype.ping = function(timeout) {
        // self alias
        var self = this;

        return this.command('ok', timeout).then(function(event) {
            // raw response string
            var raw = event.originalEvent.response.raw.trim();

            // resolve the promise
            return Promise.resolve(self._trigger('pong', event));
        });
    };

    /**
    * Get the board version.
    *
    * @method
    *
    * @param {Integer} [timeout] Response timeout.
    *
    * @return {sh.network.Request}
    *
    * {$examples sh.Board.version}
    */
    sh.Board.prototype.version = function(timeout) {
        // self alias
        var self = this;

        // get board version (raw)
        return this.command('version', timeout).then(function(event) {
            // raw response string
            // expected : Build version: edge-94de12c, Build date: Oct 28 2014 13:24:47, MCU: LPC1769, System Clock: 120MHz
            var raw = event.originalEvent.response.raw;

            // version pattern
            var version_pattern = /Build version: (.*), Build date: (.*), MCU: (.*), System Clock: (.*)/;

            // test the pattern
            var info = raw.match(version_pattern);

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
            return Promise.resolve(self._trigger('version', event, self.info));
        });
    };

    /**
    * Return a normalized path.
    *
    * @method
    *
    * @param {String} path The path to normalize.
    *
    * @return {String}
    */
    sh.Board.prototype.normalizePath = function(path) {
        return path.replace(/\/+$/gm, '');
    };

    /**
    * List files.
    *
    * @method
    *
    * @param {String}  [path='/']  The path to list file.
    * @param {Integer} [timeout=0] Connection timeout.
    *
    * @return {sh.network.Request}
    *
    * {$examples sh.Board.ls}
    */
    sh.Board.prototype.ls = function(path, timeout) {
        // self alias
        var self = this;

        // default path to root
        if (path === undefined) {
            path = '/';
        }

        // remove trailing slash
        path = self.normalizePath(path);

        // default timeout
        timeout = timeout === undefined ? 0 : timeout;

        // get board version (raw)
        return this.command('ls -s ' + path, timeout).then(function(event) {
            // raw response string
            var raw = event.originalEvent.response.raw.trim();

            // file not found
            if (raw.indexOf('Could not open directory') === 0) {
                // reject the promise
                return Promise.reject(self._trigger('error', event));
            }

            // split lines
            var lines = raw.split('\n');
            var line  = null;
            var info  = null;

            // empty files list
            var files = [];
            var file  = null;
            var isDir = false;
            var root  = null;

            // for each lines (file)
            for (var i = 0, il = lines.length; i < il; i++) {
                // current line
                line = lines[i].trim();

                // extract file/directory info (name/size)
                info = line.match(/^([a-z0-9_\-\.]+)(\/| [0-9]+)$/, 'gi');

                if (info) {
                    // is directory ?
                    isDir = info[2] == '/';

                    // fix root path
                    root = path.length ? path : '/';

                    // set file info
                    files.push({
                        root: root,
                        name: info[1],
                        path: path + '/' + info[1],
                        type: isDir ? 'directory' : 'file',
                        size: isDir ? 0 : parseInt(info[2])
                    });
                }
            }

            // resolve the promise
            return Promise.resolve(self._trigger('ls', event, files));
        });
    };

    /**
    * List all files (recursive).
    *
    * @method
    *
    * @param {String}  [path='/']  The path to list file.
    * @param {Integer} [timeout]   Connection timeout.
    * @param {Boolean} [innerCall] Used internaly for recursion.
    *
    * @return {sh.network.Request}
    *
    * {$examples sh.Board.lsAll}
    */
    sh.Board.prototype.lsAll = function(path, timeout, innerCall) {
        // self alias
        var self = this;

        // empty file tree
        var tree  = [];
        var files = null;
        var file  = null;

        var directory = [];
        var promise   = null;

        // List root path
        return this.ls(path, timeout).then(function(event) {
            // files list
            files = event.data;

            // add root directory
            if (! innerCall && files.length) {
                // first file
                file = files[0];

                tree.push({
                    root: null,
                    name: file.root.split('/').pop(),
                    path: file.root,
                    type: 'directory',
                    size: 0
                });
            }

            // for each file or directory
            for (var i = 0, il = files.length; i < il; i++) {
                // current file
                file = files[i];

                // add file/directory to the tree
                tree.push(file);

                // if not a directory
                if (file.type == 'file') {
                    // go to next file
                    continue;
                }

                // list the directory
                directory.push(self.lsAll(file.path, timeout, true));
            }

            if (! directory.length) {
                // resolve the promise
                return Promise.resolve(self._trigger('lsAll', event, tree));
            }

            return Promise.all(directory).then(function(events) {
                // for each Promise events
                for (var i = 0, il = events.length; i < il; i++) {
                    // add results to tree
                    tree = tree.concat(events[i].data);
                }

                // resolve the promise
                return Promise.resolve(self._trigger('lsAll', event, tree));
            });
        })
        .then(function(event) {
            // if inner call
            if (innerCall) {
                // resolve the promise
                return Promise.resolve(event);
            }

            // current directory
            directory = null;

            // update directories size
            for (var i = tree.length - 1; i >= 0; i--) {
                // current file
                file = tree[i];

                // if not a file
                if (file.type == 'directory') {
                    // go to next file
                    continue;
                }

                // for each file/directory
                for (var j = 0, jl = tree.length; j < jl; j++) {
                    // current directory
                    directory = tree[j];

                    // test if this file is in this tree node
                    if (file.root.indexOf(directory.path) == 0 && directory.type == 'directory') {
                        // update directory size
                        directory.size += file.size;
                    }
                }
            }

            // resolve the promise with updated tree
            return Promise.resolve(self._trigger('lsAll', event, tree));
        });
    };

    /**
    * Move a file.
    *
    * @method
    *
    * @param {String}  source    Absolute source file path.
    * @param {String}  target    Absolute target file path.
    * @param {Integer} [timeout] Connection timeout.
    *
    * @return {sh.network.Request}
    *
    * {$examples sh.Board.mv}
    */
    sh.Board.prototype.mv = function(source, target, timeout) {
        // self alias
        var self = this;

        // remove trailing slash
        source = this.normalizePath(source || '');
        target = this.normalizePath(target || '');

        // send the command (promise)
        return this.command('mv ' + source + ' ' + target, timeout).then(function(event) {
            // raw response string
            var raw = event.originalEvent.response.raw.trim();

            // Error ?
            if (raw.indexOf('Could not rename') === 0) {
                // reject the promise
                return Promise.reject(self._trigger('error', event));
            }

            // resolve the promise
            return Promise.resolve(self._trigger('mv', event, raw));
        });
    };

    /**
    * Remove a file.
    *
    * If multiple files is provided, the promise is rejected on first error!
    *
    * @method
    *
    * @param {String|Array} paths     Absolute file path or array of paths.
    * @param {Integer}      [timeout] Connection timeout.
    *
    * @return {sh.network.Request}
    *
    * {$examples sh.Board.rm}
    */
    sh.Board.prototype.rm = function(paths, timeout) {
        // self alias
        var self = this;

        // multiple files
        if (typeof paths != 'string') {
            var promises = [];

            for (var i = 0, il = paths.length; i < il; i++) {
                promises.push(this.rm(paths[i], timeout));
            }

            return Promise.all(promises);
        }

        // remove trailing slash
        paths = this.normalizePath(paths);

        // send the command (promise)
        return this.command('rm ' + paths, timeout).then(function(event) {
            // raw response string
            var raw = event.originalEvent.response.raw.trim();

            // Error ?
            if (raw.indexOf('Could not delete') === 0) {
                // reject the promise
                return Promise.reject(self._trigger('error', event));
            }

            // response data
            var data = 'deleted ' + paths;

            // resolve the promise
            return Promise.resolve(self._trigger('rm', event, data));
        });
    };

    /**
    * Upload a file.
    *
    * @method
    *
    * @param {File|Blob|String} file       An File or Blob object. Or a string to put in the file.
    * @param {String}           [filename] The file name. Not optional if the file param is a string.
    * @param {Integer}          [timeout]  Connection timeout.
    *
    * @return {sh.network.Request}
    *
    * {$examples sh.Board.upload}
    */
    sh.Board.prototype.upload = function(file, filename, timeout) {
        // self alias
        var self = this;

        // file is a string
        if (typeof file === 'string') {
            // normalize line endding
            file = file.replace('\r\n', '\n');

            // force EOF
            if (file[file.length - 1] !== '\n') {
                file += '\n';
            }

            // convert to Blob object
            file = new Blob([file], { 'type': 'text/plain' });
        }
        else {
            filename = filename || file.name;
        }

        // return POST request (promise)
        return sh.network.post({
            url    : 'http://' + self.address + '/upload',
            headers: { 'X-Filename': filename },
            timeout: timeout,
            data   : file
        });
    };

    /**
    * Get file content.
    *
    * @method
    *
    * @param {String}  path      File path.
    * @param {Integer} [limit]   Number of lines.
    * @param {Integer} [timeout] Connection timeout.
    *
    * @return {Promise}
    *
    * {$examples sh.Board.cat}
    */
    sh.Board.prototype.cat = function(path, limit, timeout) {
        // self alias
        var self = this;

        // clean path
        path = path.replace(/^\//, '');

        // command
        var settings = {
            url    : 'http://' + self.address + '/' + path,
            timeout: timeout
        };

        // send the command (promise)
        return sh.network.get(settings).then(function(event) {
            // raw response string
            var raw = event.response.raw;

            // normalize line endding
            var text = raw.replace('\r\n', '\n');

            // limit output...
            if (limit) {
                text = text.split('\n').slice(0, limit).join('\n');
            }

            // resolve the promise
            return Promise.resolve(self._trigger('cat', event, text));
        });
    };

    /**
    * Get position.
    *
    * @method
    *
    * @param {Integer} [timeout] Connection timeout.
    *
    * @return {Promise}
    *
    * {$examples sh.Board.pos}
    */
    sh.Board.prototype.pos = function(timeout) {
        // self alias
        var self = this;

        // send the command (promise)
        return self.command('get pos', timeout).then(function(event) {
            // raw response string
            var raw = event.originalEvent.response.raw;

            // split on new line
            var lines = raw.trim().split('\n');

            // normalize type
            var normalizeType = function(type) {
                return type.trim().split(' ').pop().toUpperCase();
            };

            // make position array
            var pos = {
                types : {},
                values: [],

                get: function(type, axis, value) {
                    type = normalizeType(type);

                    var index = this.types[type];

                    if (index !== undefined) {
                        value = this.values[index];
                    }

                    if (value && axis) {
                        axis  = axis.toUpperCase();
                        value = value[axis] || value;
                    }

                    return value;
                }
            };

            var parts, type, command, description, values, value;

            for (var i = 0; i < lines.length; i++) {
                // get position type
                parts = lines[i].split(': ');
                type  = parts.shift();

                // normalize type
                type = normalizeType(type);

                // set command/description
                // C   : M114   - WCS.
                // WPOS: M114.1 - Realtime WCS.
                // MPOS: M114.2 - Realtime machine coordinate system.
                // APOS: M114.3 - Realtime actuator position.
                // LMS : M114.4 - Last milestone.
                // LMP : M114.5 - Last machine position.
                switch (type) {
                    case 'C':
                        command     = 'M114';
                        description = 'Position of all axes';
                        break;
                    case 'WPOS':
                        command     = 'M114.1';
                        description = 'Real time position of all axes';
                        break;
                    case 'MPOS':
                        command     = 'M114.2';
                        description = 'Real time machine position of all axes';
                        break;
                    case 'APOS':
                        command     = 'M114.3';
                        description = 'Real time actuator position of all actuators';
                        break;
                    case 'LMS':
                        command     = 'M114.4';
                        description = 'Last milestone';
                        break;
                    case 'LMP':
                        command     = 'M114.5';
                        description = 'Last machine position';
                        break;
                    default:
                        command     = 'M114.?';
                        description = 'Unknown type';
                }

                // set base values
                values = {
                    type       : type,
                    command    : command,
                    description: description
                };

                // get position values
                parts  = parts[0].split(' ');

                for (var j = 0; j < parts.length; j++) {
                    value = parts[j].split(':');
                    values[value[0]] = value[1];
                }

                pos.types[type] = i;
                pos.values.push(values);
            }

            // nothing found
            if (! pos.values.length) {
                // reject the promise
                return Promise.reject(self._trigger('error', event));
            }

            // resolve the promise
            return Promise.resolve(self._trigger('pos', event, pos));
        });
    };

})();
