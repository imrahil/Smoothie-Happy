/**
* Scanner module.
* @namespace
*/
sh.scanner = {
    /**
    * @property  {String}  input  Input to scan.
    * @default   192.168.1.*.
    */
    input: '192.168.1.*',

    /**
    * @property  {Integer}  timeout  Default response timeout in milliseconds.
    * @default 1000
    */
    timeout: 1000,

    /**
    * @readonly
    * @property {Boolean} scanning Is scanning.
    */
    scanning: false,

    /**
    * @readonly
    * @property {Integer} scanned Number of ip scanned.
    */
    scanned: 0,

    /**
    * @readonly
    * @property {String} total Total number of ip to scan.
    */
    total: 0,

    /**
    * @readonly
    * @property {Integer} found Number of borads found.
    */
    found: 0,

    /**
    * @readonl
    * @property {Array} queue Ip's queue to scann.
    */
    queue: [],

    /**
    * @readonly
    * @property {Object} boards Known boards list.
    */
    boards: {},

    /**
    * @readonly
    * @property {Boolean} aborted Aborted scann status.
    */
    aborted: false
};

/**
* Called when scan start.
* @method sh.scanner.onstart
* @param  {Array}  queue Ip's queue to scann.
*/
sh.scanner.onstart = function(queue) {};

/**
* Called when board found.
* @method sh.scanner.onboard
* @param  {Object}  board Board version.
*/
sh.scanner.onboard = function(board) {};

/**
* Called when scan progress.
* @method sh.scanner.onprogress
* @param  {String}  ip     Current ip.
* @param  {Mixed}   board  Board version if found or null.
*/
sh.scanner.onprogress = function(ip, board) {};

/**
* Called when abort scan.
* @method sh.scanner.onabort
*/
sh.scanner.onabort = function() {};

/**
* Called when resume scan.
* @method sh.scanner.onresume
*/
sh.scanner.onresume = function() {};

/**
* Called when scan stop.
* @method sh.scanner.onstop
*/
sh.scanner.onstop = function() {};

/**
* Called when scan end.
* @method sh.scanner.onend
* @param  {Integer}  found Number of boards found.
*/
sh.scanner.onend = function(found) {};

/**
* Set scan timeout.
* @method sh.scanner.setTimeout
* @param  {Integer}     timeout  Scan timeout in milliseconds [min: 100, max: 2000].
* @return {sh.scanner}  this     Chainable
*/
sh.scanner.setTimeout = function(timeout) {
    // out of range test
    if (timeout < 100 || timeout > 2000) {
        throw new Error('Timeout is out of range [100, 2000].');
    }

    // set the timeout
    this.timeout = timeout;

    // return self
    return this;
};

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
* @method sh.scanner.setInput
* @param  {String|Array}  input  Ip's scan pattern.
* @return {sh.scanner}    this   Chainable
*/
sh.scanner.setInput = function(input) {
    // reset queue
    this.queue = [];

    // input array
    var inputArray = input;

    // split input on comma if not an array
    if (typeof inputArray === 'string') {
        inputArray = inputArray.split(',');
    }

    // too short or not defined
    if (inputArray.length === 0) {
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

    // set input
    this.input = input;

    // return self
    return this;
};

/**
* Shift and scan an ip from the queue looking for a SmoothieBoard.
* @method sh.scanner.processQueue
* @protected
*/
sh.scanner.processQueue = function() {
    // not in scan mode
    if (!this.scanning) {
        return false;
    }

    // shift first ip from the queue
    var ip = this.queue.shift();

    // end of queue
    if (! ip) {
        this.onend(this.found);
        this.scanning = false;
        return true;
    }

    // self alias
    var self  = this;

    // board object
    var board = null;

    // try to get the board version
    sh.command.version(ip, {
        // set default timeout
        timeout : self.timeout,

        // on response
        onresponse: function(response) {
            // board version info
            board = response.result;

            // increment found counter
            self.found++;

            // add/update the board
            self.boards[ip] = board;

            // notify board found
            self.onboard(board);
        },

        // in any case
        onloadend: function() {
            // increment scanned counter
            self.scanned++;

            // notify progression
            self.onprogress(ip, board);

            // scan next ip
            self.processQueue();
        }
    });
};

/**
* Scan the network looking for some Smoothie boards.
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
* @method sh.scanner.scan
* @param  {String|Array}           input               Ip's scan pattern.
* @param  {Object}                 settings            Scan settings.
* @param  {Integer}                settings.timeout    Scan timeout for each ip.
* @param  {sh.scanner.onstart}     settings.onstart    ...
* @param  {sh.scanner.onboard}     settings.onboard    ...
* @param  {sh.scanner.onprogress}  settings.onprogress ...
* @param  {sh.scanner.onabort}     settings.onabort    ...
* @param  {sh.scanner.onresume}    settings.onresume   ...
* @param  {sh.scanner.onstop}      settings.onstop     ...
* @param  {sh.scanner.onend}       settings.onend      ...
* @return {sh.scanner}             this                Chainable
*/
sh.scanner.scan = function(input, settings) {
    if (this.scanning) {
        throw new Error('Already in scan mode.');
    }

    // default settings
    settings = settings || {};

    // default timeout
    var timeout = settings.timeout || null;

    // set input and timeout
    input   && this.setInput(input);
    timeout && this.setTimeout(timeout);

    // reset scann properties
    this.scanning = true;
    this.aborted  = false;
    this.total    = this.queue.length;
    this.scanned  = 0;
    this.found    = 0;
    this.boards   = {};

    // set user callbacks
    for (var callback in settings) {
        if (callback.indexOf('on') === 0 && this[callback]) {
            this[callback] = settings[callback];
        }
    }

    // call onstart callback
    this.onstart(this.queue);

    // process queue
    this.processQueue();

    // return self
    return this;
};

/**
* Stop current scan.
* @method sh.scanner.stop
* @param  {Boolean}  [silent]  If true the [onstop] callback was not trigered {@default false}.
* @return {Boolean}  status    Return [true] if stopped, [false] if already stopped.
*/
sh.scanner.stop = function(silent) {
    if (this.scanning || this.aborted) {
        !silent && this.onstop(this);
        this.scanning = false;
        this.aborted  = false;
        return true;
    }
    return false;
};

/**
* Abort current scan.
* @method sh.scanner.abort
* @return {Boolean}  status  Return [true] if aborted, [false] if already aborted.
*/
sh.scanner.abort = function() {
    if (this.stop(true)) {
        this.aborted = true;
        this.onabort(this);
        return true;
    }
    return false;
};

/**
* Resume aborted scan.
* @method sh.scanner.resume
* @param  {Integer}  [timeout]  Optionally resume with a new timeout.
* @return {Boolean}  status     Return [true] if resumed, [false] if not resumable.
*/
sh.scanner.resume = function(timeout) {
    if (this.aborted) {
        timeout && this.setTimeout(timeout);
        this.aborted  = false;
        this.scanning = true;
        this.onresume(this);
        this.processQueue();
        return true;
    }
    return false;
};
