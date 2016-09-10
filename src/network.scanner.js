(function () {
    'use strict';

    /**
    * Network scanner.
    *
    * @class
    * @param  {Object}        settings          Scanner settings.
    * @param  {String|Array}  settings.input    Ip's scan pattern. See {@link sh.network.Scanner#setInput|setInput} for details.
    * @param  {Integer}       settings.timeout  Scan timeout in milliseconds. See {@link sh.network.Scanner#setTimeout|setTimeout} for details.
    *
    * {$examples sh.network.Scanner}
    */
    sh.network.Scanner = function(settings) {
        // instance factory
        if (! (this instanceof sh.network.Scanner)) {
            return new sh.network.Scanner(settings);
        }

        // defaults settings
        settings = settings || {};

        /**
        * @protected
        * @property  {Object}  -  Registred callbacks.
        */
        this._on = {};

        /**
        * @readonly
        * @property  {String}  input  Input to scan.
        * @default   192.168.1.*.
        */
        this.input = settings.input || '192.168.1.*';

        /**
        * @readonly
        * @property  {Array}  queue  Ip's queue to scann.
        */
        this.queue = [];

        /**
        * @readonly
        * @property  {Integer}  timeout  Default scan response timeout in milliseconds.
        * @default 1000
        */
        this.timeout = settings.timeout === undefined ? 1000 : settings.timeout;

        /**
        * @readonly
        * @property  {Integer}  boardTimeout  Default board response timeout in milliseconds.
        * @default 1000
        */
        this.boardTimeout = settings.boardTimeout === undefined ? 5000 : settings.boardTimeout;

        /**
        * @readonly
        * @property  {Boolean}  scanning  Is scanning.
        */
        this.scanning = false;

        /**
        * @readonly
        * @property  {Boolean}  aborted  Aborted scann status.
        */
        this.aborted = false;

        /**
        * @readonly
        * @property  {Integer}  total  Total number of ip to scan.
        */
        this.total = 0;

        /**
        * @readonly
        * @property  {Integer}  scanned Number of ip scanned.
        */
        this.scanned = 0;

        /**
        * @readonly
        * @property  {Integer}  found  Number of boards found.
        */
        this.found = 0;

        /**
        * @readonly
        * @property  {Object}  boards  Known boards list.
        */
        this.boards = {};

    };

    // -------------------------------------------------------------------------

    /**
    * On scan start callback.
    *
    * @callback sh.network.Scanner~onStart
    * @param  {sh.network.Scanner}  scanner  Scanner instance.
    */

    /**
    * On scan pause callback.
    *
    * @callback sh.network.Scanner~onPause
    * @param  {sh.network.Scanner}  scanner  Scanner instance.
    */

    /**
    * On scan resume callback.
    *
    * @callback sh.network.Scanner~onResume
    * @param  {sh.network.Scanner}  scanner  Scanner instance.
    */

    /**
    * On scan stop callback.
    *
    * @callback sh.network.Scanner~onStop
    * @param  {sh.network.Scanner}  scanner  Scanner instance.
    */

    /**
    * On board found callback.
    *
    * @callback sh.network.Scanner~onBoard
    * @param  {sh.network.Scanner}  scanner  Scanner instance.
    * @param  {sh.Board}            board    Board instance.
    */

    /**
    * On scan end callback.
    *
    * @callback sh.network.Scanner~onEnd
    * @param  {sh.network.Scanner}  scanner  Scanner instance.
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
    * | Name    | Type | Description |
    * | ------- | ---- | ----------- |
    * | start   | {@link sh.network.Scanner~onStart|onStart}   | Called before scan start.  |
    * | pause   | {@link sh.network.Scanner~onPause|onPause}   | Called after scan pause.   |
    * | resume  | {@link sh.network.Scanner~onResume|onResume} | Called before scan resume. |
    * | stop    | {@link sh.network.Scanner~onStop|onStop}     | Called after scan stop.    |
    * | stop    | {@link sh.network.Scanner~onBoard|onBoard}   | Called after board found.  |
    * | stop    | {@link sh.network.Scanner~onEnd|onEnd}       | Called after scan end.     |
    */
    sh.network.Scanner.prototype.on = function(event, callback) {
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
    * @param  {String}  event  Event name.
    * @param  {Array}   args   Arguments to pass to the callback.
    * @return {self}
    */
    sh.network.Scanner.prototype._trigger = function(name, args) {
        // if defined, call user callback
        this._on[name] && this._on[name].apply(this, args || []);

        // chainable
        return this;
    };

    // -------------------------------------------------------------------------

    /**
    * Set the input and compute the scan queue.
    *
    * **Allowed inputs :**
    * ```
    * - Wildcard  : '192.168.1.*'
    * - Single IP : '192.168.1.100'
    * - IP Range  : '192.168.1.100-120'
    * - Hostname  : 'my.smoothie.board'
    * - Mixed     : '192.168.1.100, my.smoothie.board'
    * - Array     : ['192.168.1.100-120', 'my.smoothie.board']
    * ```
    *
    * @method
    * @param  {String|Array}  input  Ip's scan pattern.
    * @return {self}
    */
    sh.network.Scanner.prototype.setInput = function(input) {
        // Not alowed in scan mode.
        if (this.scanning) {
            throw new Error('Already in scan mode.');
        }

        // reset queue
        this.queue = [];

        // input array
        var inputArray = input;

        // split input on comma if not an array
        if (typeof inputArray === 'string') {
            inputArray = inputArray.split(',');
        }

        // too short or not defined
        if (! inputArray || inputArray.length === 0) {
            throw new Error('Invalid input.');
        }

        // trim input parts
        inputArray = inputArray.map(function(part) {
            return part.trim();
        });

        // for each parts
        for (var y = 0, yl = inputArray.length; y < yl; y++) {
            // current part
            var currentInput = inputArray[y];

            // Wildcard | ex.: [192.168.1.*]
            if (/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.\*$/.test(currentInput)) {
                var currentInputParts = currentInput.split('.');
                currentInputParts.pop(); // remove last part (*)
                var baseIp = currentInputParts.join('.');
                for (var i = 0; i <= 255; i++) {
                    this.queue.push(baseIp + '.' + i);
                }
            }

            // Single ip | ex.: [192.168.1.55]
            else if (/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/.test(currentInput)) {
                this.queue.push(currentInput);
            }

            // Ip's range | ex.: [192.168.1.50-100]
            else if (/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\-[0-9]{1,3}$/.test(currentInput)) {
                var currentInputParts = currentInput.split('.');
                var currentInputRange = currentInputParts.pop().split('-'); // last part (xxx-xxx)
                var baseIp     = currentInputParts.join('.');
                for (var i = currentInputRange[0], il = currentInputRange[1]; i <= il; i++) {
                    this.queue.push(baseIp + '.' + i);
                }
            }

            // Hostname | ex.: [www.host.name]
            else if (/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/.test(currentInput)) {
                this.queue.push(currentInput);
            }

            // Invalid...
            else {
                throw new Error('Invalid input.');
            }
        }

        // update input
        this.input = input;

        // return self
        return this;
    };

    /**
    * Set scan timeout.
    * @method
    * @param  {Integer}  timeout  Scan timeout in milliseconds [min: 100, max: 2000].
    * @return {self}
    */
    sh.network.Scanner.prototype.setTimeout = function(timeout) {
        // out of range test
        if (timeout < 100 || timeout > 2000) {
            throw new Error('Timeout is out of range [100, 2000].');
        }

        // set the timeout
        this.timeout = timeout;

        // return self
        return this;
    };

    // -------------------------------------------------------------------------

    /**
    * Shift and scan an ip from the queue looking for a SmoothieBoard.
    * @method
    * @protected
    * @return {Boolean|null}
    */
    sh.network.Scanner.prototype._processQueue = function() {
        // not in scan mode
        if (! this.scanning) {
            return false;
        }

        // shift first address from the queue
        var address = this.queue.shift();

        // end of queue
        if (! address) {
            this._trigger('end', [this]);
            this.scanning = false;
            return true;
        }

        // self alias
        var self  = this;

        // board object
        try {
            sh.Board({
                address : address,
                timeout : this.timeout,
                callback: function(result) {
                    // increment scanned counter
                    self.scanned++;

                    // no error
                    if (! result.error) {
                        // increment found counter
                        self.found++;

                        // add the board
                        self.boards[address] = this;

                        // set timeout to infinity
                        this.timeout = self.boardTimeout;

                        // trigger board event
                        self._trigger('board', [self, this]);
                    }

                    // trigger progress event
                    self._trigger('progress', [self]);

                    // process queue
                    self._processQueue();
                }
            });
        }
        catch(error) {
            // increment scanned counter
            self.scanned++;

            // trigger progress event
            self._trigger('progress', [self]);

            // process queue
            self._processQueue();
        }

        // return null
        return null;
    };

    // -------------------------------------------------------------------------

    /**
    * Start new scan.
    *
    * @method
    * @param  {String|Array}  input    Ip's scan pattern. See {@link sh.network.Scanner#setInput|setInput} for details.
    * @param  {Integer}       timeout  Scan timeout in milliseconds. See {@link sh.network.Scanner#setTimeout|setTimeout} for details.
    * @return {self}
    */
    sh.network.Scanner.prototype.start = function(input, timeout) {
        // set the input
        this.setInput(input || this.input);

        // set the timeout
        timeout && this.setTimeout(timeout);

        // set scan status
        this.scanning = true;
        this.aborted  = false;
        this.total    = this.queue.length;
        this.scanned  = 0;
        this.found    = 0;
        this.boards   = {};

        // call user callback
        this._trigger('start', [this]);

        // process queue
        this._processQueue();

        // chainable
        return this;
    };

    /**
    * Stop current scan.
    *
    * @method
    * @return {self}
    */
    sh.network.Scanner.prototype.stop = function() {
        if (this.scanning || this.aborted) {
            // set scan status
            this.scanning = false;
            this.aborted  = false;

            // call user callback
            this._trigger('stop', [this]);
        }

        // chainable
        return this;
    };

    /**
    * Pause current scan.
    *
    * @method
    * @return {self}
    */
    sh.network.Scanner.prototype.pause = function() {
        if (this.scanning) {
            // set scan status
            this.scanning = false;
            this.aborted  = true;

            // call user callback
            this._trigger('pause', [this]);
       }

        // chainable
        return this;
    };

    /**
    * Resume current scan.
    *
    * @method
    * @return {self}
    */
    sh.network.Scanner.prototype.resume = function() {
        if (this.aborted) {
            // set scan status
            this.aborted  = false;
            this.scanning = true;

            // call user callback
            this._trigger('resume', [this]);

            // process queue
            this._processQueue();
        }

        // chainable
        return this;
    };

})();
