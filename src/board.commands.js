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

    /**
    * Send ping command (ok).
    *
    * @method
    *
    * @param {Integer} [timeout] Response timeout.
    *
    * @return {sh.network.Request}
    */
    sh.Board.prototype.ping = function(timeout) {
        return this.command('ok', timeout);
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
            return Promise.resolve(sh.BoardEvent('version', self, event, self.info));
        });
    };

    /**
    * List files.
    *
    * @method
    *
    * @param {String}  [path='/'] The path to list file.
    * @param {Integer} [timeout]  Connection timeout.
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
            path = '';
        }

        // normalize path to my/path
        path = path.replace(/^\/+|\/+$/gm, '');

        // get board version (raw)
        return this.command('ls -s ' + path, timeout).then(function(event) {
            // raw response string
            var raw = event.originalEvent.response.raw;

            // file not found
            if (raw.indexOf('Could not open directory') === 0) {
                return Promise.reject(sh.BoardEvent('ls', self, event, raw));
            }

            // split lines
            var lines = raw.split('\n');
            var line  = null;
            var info  = null;

            // empty files list
            var files = [];
            var file  = null;

            // for each lines (file)
            for (var i = 0, il = lines.length; i < il; i++) {
                // current line
                line = lines[i].trim();

                // extract file/directory info (name/size)
                info = line.match(/^([a-z0-9_\-\.]+)(\/| [0-9]+)$/, 'gi');

                if (info) {
                    // set file info
                    files.push({
                        name: info[1],
                        root: path + '/',
                        path: path + '/' + info[1],
                        type: info[2] == '/' ? 'directory' : 'file',
                        size: info[2] == '/' ? -1 : parseInt(info[2])
                    });
                }
            }

            // resolve the promise
            return Promise.resolve(sh.BoardEvent('ls', self, event, files));
        });
    };

    /**
    * List all files (recursive)
    *
    * @method
    *
    * @param {String}  [path='/'] The path to list file.
    * @param {Integer} [timeout]  Connection timeout.
    *
    * @return {sh.network.Request}
    *
    * {$examples sh.Board.lsAll}
    */
    sh.Board.prototype.lsAll = function(path, timeout) {
        // self alias
        var self = this;

        // empty file tree
        var tree  = {};
        var files = null;
        var file  = null;

        var directory = [];
        var promise   = null;

        // List root path
        return this.ls(path, timeout).then(function(event) {
            // files list
            files = event.data;

            // for each file or directory
            for (var i = 0, il = files.length; i < il; i++) {
                // current file
                file = files[i];

                // add file/directory to the tree
                tree[file.path] = file;

                // if not a directory
                if (file.type == 'file') {
                    // go to next file
                    continue;
                }

                // list the directory
                directory.push(self.lsAll(file.path, timeout));
            }

            if (! directory.length) {
                // resolve the promise
                return Promise.resolve(sh.BoardEvent('lsAll', self, event, tree));
            }

            return Promise.all(directory).then(function(events) {
                for (var i = 0, il = events.length; i < il; i++) {
                    for (var file in events[i].data) {
                        tree[file] = events[i].data[file];
                    }
                }

                // resolve the promise
                return Promise.resolve(sh.BoardEvent('lsAll', self, event, tree));
            });
        });
    };

})();
