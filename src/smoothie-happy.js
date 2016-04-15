+function (global) {

    // global namespace
    var sh = {
        version    : '0.0.1-alpha',
        name       : 'Smoothie Happy',
        description: 'Smoothieware network communication API.'
    };

    // initialization message
    console.info(sh.name + ' - v' + sh.version);

    // -------------------------------------------------------------------------

    // network namespace
    sh.network = {
        version: '0.0.1-alpha',
        timeout: 1000
    };

    sh.network.post = function(uri, data, callback, timeout) {
        var data = data || '';
        var xhr  = new XMLHttpRequest();

        xhr.timeout = timeout || this.timeout;

        xhr.addEventListener('load', function() {
            callback && callback('load', xhr);
        });
        xhr.addEventListener('error', function() {
            callback && callback('error', xhr);
        });
        xhr.addEventListener('timeout', function() {
            callback && callback('timeout', xhr);
        });

        //uri += '?time=' + Date.now(); // no-cache

        xhr.open('POST', uri, true);
        xhr.send(data);
    };

    // -------------------------------------------------------------------------

    // network scanner
    sh.network.scanner = {
        version   : '0.0.1-alpha',
        timeout   : 500,
        scanning  : false,
        scanned   : 0,
        total     : 0,
        found     : 0,
        queue     : [],
        boards    : {},
        aborted   : false,
        storage   : true,
        input     : '192.168.1.*',
        onStart   : function(queue) {},
        onBoard   : function(board) {},
        onProgress: function(ip, board, self) {},
        onAbort   : function(self) {},
        onResume  : function(self) {},
        onStop    : function(self) {},
        onEnd     : function(found) {}
    };

    // scan an IP looking for a SmoothieBoard
    sh.network.scanner.processQueue = function() {
        if (!this.scanning) {
            return false;
        }

        var ip = this.queue.shift();

        if (! ip) {
            this.onEnd(this.found);
            this.scanning = false;
            return true;
        }

        var self  = this;
        var board = null;
        var uri   = 'http://' + ip + '/command';

        console.log('scan:', ip);

        sh.network.post(uri, 'version\n', function(type, xhr) {

            if (type === 'load' && xhr.status === 200) {
                var text = xhr.responseText;

                // expected : Build version: edge-94de12c, Build date: Oct 28 2014 13:24:47, MCU: LPC1769, System Clock: 120MHz
                var matches = text.match(/Build version: (.*), Build date: (.*), MCU: (.*), System Clock: (.*)/);

                if (matches) {
                    board = {
                        ip     : ip,
                        version: matches[1],
                        date   : matches[2],
                        mcu    : matches[3],
                        clock  : matches[4]
                    };
                    self.found++;
                    self.boards[ip] = board;
                    self.onBoard(board);
                }
            }

            self.scanned++;
            self.onProgress(ip, board, self);
            self.processQueue();

        }, this.timeout);
    };

    // locale storage shortcut
    sh.network.scanner.store = function(index, value) {
        // no locale storage
        if (!this.storage) return;

        // get the store
        var store = JSON.parse(localStorage.getItem('sh.network.scanner') || '{}');

        // load stored values
        if (! index) {
            for (var index in store) {
                this[index] = store[index];
            }
            return;
        }

        // get old value at index
        var oldValue = store[index] || undefined;

        // store the new value
        if (arguments.length > 1) {
            store[index] = value;
            localStorage.setItem('sh.network.scanner', JSON.stringify(store));
        }

        // return the old value
        return oldValue;
    };

    // set timeout
    sh.network.scanner.setTimeout = function(timeout) {
        if (timeout < 100 || timeout > 2000) {
            throw new Error('Timeout is out of range [100, 2000].');
        }
        this.timeout = timeout;
        this.store('timeout', timeout);
    };

    // set the input and compute the scan queue
    sh.network.scanner.setInput = function(input) {
        // reset queue
        this.queue = [];

        // too short or not defined
        if (!input || input.length < 3) {
            throw new Error('Invalid input.');
        }

        // input array
        var inputArray = input;

        // split input on comma if not an array
        if (typeof inputArray === 'string') {
            inputArray = inputArray.split(',');
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
        this.store('input', input);

        // return the queue
        return this.queue;
    };

    // scan the network looking for a SmoothieBoard
    sh.network.scanner.scan = function(input, timeout) {
        if (this.scanning) {
            throw new Error('Already in scan mode.');
        }

        input && this.setInput(input);
        timeout && this.setTimeout(timeout);

        this.scanning = true;
        this.aborted  = false;
        this.total    = this.queue.length;
        this.scanned  = 0;
        this.boards   = {};
        this.found    = 0;

        this.onStart(this.queue);
        this.processQueue();
    };

    // stop scanning
    sh.network.scanner.stop = function(silent) {
        if (this.scanning || this.aborted) {
            !silent && this.onStop(this);
            this.scanning = false;
            this.aborted  = false;
            return true;
        }
        return false;
    };

    // abort scanning
    sh.network.scanner.abort = function() {
        if (this.stop(true)) {
            this.aborted = true;
            this.onAbort(this);
            return true;
        }
        return false;
    };

    // resume aborted scanning
    sh.network.scanner.resume = function(timeout) {
        if (this.aborted) {
            timeout && this.setTimeout(timeout);
            this.scanning = true;
            this.aborted = false;
            this.onResume(this);
            this.processQueue();
            return true;
        }
        return false;
    };

    // -------------------------------------------------------------------------

    // export global namespace
    global.smoothieHappy = sh;

}(window);
