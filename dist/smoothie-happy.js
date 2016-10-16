/**
* Smoothie-Happy - A SmoothieBoard network communication API.
* @author   Sébastien Mischler (skarab) <sebastien@onlfait.ch>
* @see      {@link https://github.com/lautr3k/Smoothie-Happy}
* @build    b11d19cafdbd65105f75be20bee8f532
* @date     Sun, 16 Oct 2016 16:56:26 +0000
* @version  0.2.0-dev
* @license  MIT
* @namespace
*/
var sh = sh || {};

(function () {
    'use strict';

    /**
    * @property {String} version API version.
    * @default
    * @readonly
    */
    sh.version = '0.2.0-dev';

    /**
    * @property {String} build API build hash.
    * @default
    * @readonly
    */
    sh.build = 'b11d19cafdbd65105f75be20bee8f532';

    /**
    * @property {String} id API id.
    * @default
    * @readonly
    */
    sh.id = 'smoothie-happy';

    /**
    * @property {String} name API name.
    * @default
    * @readonly
    */
    sh.name = 'Smoothie-Happy';

    /**
    * @property {String} description API description.
    * @default
    * @readonly
    */
    sh.description = 'A SmoothieBoard network communication API';

    /**
    * @property {String} gitURL API repository url.
    * @default
    * @readonly
    */
    sh.gitURL = 'git://github.com/lautr3k/Smoothie-Happy.git';

    /**
    * Network module.
    *
    * @namespace
    */
    sh.network = {};

    /**
    * XMLHttpRequest response abstraction class.
    *
    * @class
    *
    * @param {XMLHttpRequest} xhr An `XMLHttpRequest` instance.
    */
    sh.network.Response = function(xhr) {
        // instance factory
        if (! (this instanceof sh.network.Response)) {
            return new sh.network.Response(xhr);
        }

        // text/xml response available ?
        var responseText = null;
        var responseXML  = null;

        if (xhr.responseType == '' || xhr.responseType == 'document') {
            responseText = xhr.responseText;
            responseXML  = xhr.responseXML;
        }

        /** @property {Integer} - Response status code. */
        this.code = xhr.status;

        /** @property {String} - Respons status text. */
        this.message = xhr.statusText;

        /** @property {String} - Response type. */
        this.type = xhr.responseType;

        /** @property {String} - Response url. */
        this.url = xhr.responseURL;

        /** @property {String} - Response XML. */
        this.xml = responseXML;

        /** @property {String} - Response text. */
        this.text = responseText;

        /** @property {Mixed} - Raw response. */
        this.raw = xhr.response;
    };

    /**
    * Custom request event.
    *
    * @class
    *
    * @param {String}             name     Event name, possible values is `[upload.]load`, `[upload.]timeout`, `[upload.]abort` or `[upload.]error`.
    * @param {sh.network.Request} request  Original `sh.network.Request` instance.
    */
    sh.network.RequestEvent = function(name, request) {
        // instance factory
        if (! (this instanceof sh.network.RequestEvent)) {
            return new sh.network.RequestEvent(name, request);
        }

        /** @property {String} - Possible values is `[upload.]load`, `[upload.]timeout`, `[upload.]abort` or `[upload.]error`. */
        this.name = name;

        /** @property {sh.network.Request} - Request instance. */
        this.request = request;

        /** @property {sh.network.Response} - Response instance. */
        this.response = sh.network.Response(request._xhr);
    };

    /**
    * Custom progress event.
    *
    * @class
    * @extends sh.network.RequestEvent
    *
    * @param {String}             name    Event name, possible values is `progress` or `upload.progress`.
    * @param {sh.network.Request} request Original `sh.network.Request`.
    * @param {ProgressEvent}      source  Original `ProgressEvent`.
    */
    sh.network.ProgressEvent = function(name, request, source) {
        // instance factory
        if (! (this instanceof sh.network.ProgressEvent)) {
            return new sh.network.ProgressEvent(name, request, source);
        }

        // call parent constructor
        sh.network.RequestEvent.call(this, name, request);

        /** @property {String} - Possible values is `progress` or `upload.progress`. */
        this.name = name;

        /** @property {ProgressEvent} - `ProgressEvent` instance. */
        this.source = source;

        /** @property {Boolean} - If computable length. */
        this.computable = source.lengthComputable;

        /** @property {Integer} - Total bytes. */
        this.total = this.computable ? source.total : null;

        /** @property {Integer} - Loaded bytes. */
        this.loaded = this.computable ? source.loaded : null;

        /** @property {Integer} - Loaded bytes as percent. */
        this.percent = this.computable ? (this.loaded / this.total) * 100 : null;
    };

    // extends sh.network.RequestEvent
    sh.network.ProgressEvent.prototype = Object.create(sh.network.RequestEvent.prototype);
    sh.network.ProgressEvent.prototype.constructor = sh.network.ProgressEvent;

    /**
    * `XMLHttpRequest` wrapper with `Promise` logic.
    *
    * @class
    *
    * @param {Object}  settings                   Request settings.
    * @param {String}  settings.url               URL with protocol.
    * @param {String}  [settings.method  = 'GET'] 'GET', 'POST', 'DELETE', ...
    * @param {Mixed}   [settings.data    = null]  Data to send with the request.
    * @param {Object}  [settings.headers = null]  Headers to send with the request.
    * @param {Integer} [settings.timeout = 5000]  Timeout for this request in milliseconds.
    * @param {Object}  [settings.xhr     = null]  An `XMLHttpRequest` instance or an collection of `XMLHttpRequest` properties/methods to overwrite.
    *
    * @see Please read {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise|this} and {@link https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html|that} to learn more about promises.
    *
    * @example
    * ### Single request
    * ```
    * sh.network.Request({
    *     url: 'index.html'
    * })
    * .onProgress(function(event) {
    *     // notify progression
    *     console.info(event.request._url, '>> progress >>',  event.percent, '%');
    * })
    * .then(function(event) {
    *     // index.html is loaded
    *     console.info(event.request._url, '>> loaded >>', event.response);
    * 
    *     // return result for final then
    *     return { event: event, error: false };
    * })
    * .catch(function(event) {
    *     // error loading index.html
    *     console.warn(event.request._url, '>> error >>', event.response);
    * 
    *     // return error for final then
    *     return { event: event, error: true };
    * })
    * .then(function(result) {
    *     // finaly ...
    *     var event    = result.event;
    *     var logType  = result.error ? 'error' : 'info';
    *     var logLabel = result.error ? 'error' : 'loaded';
    * 
    *     console[logType](event.request._url, '>>', logLabel, '>>', event.response);
    * });
    * ```
    * 
    * @example
    * ### Chaining requests
    * ```
    * sh.network.Request({
    *     url: 'index.html'
    * })
    * .onProgress(function(event) {
    *     // notify progression
    *     console.info(event.request._url, '>> progress >>',  event.percent, '%');
    * })
    * .then(function(event) {
    *     // index.html is loaded
    *     console.info(event.request._url, '>> loaded >>', event.response);
    * 
    *     // return another request
    *     return sh.network.Request({
    *         url: 'not_found.html'
    *     })
    *     .onProgress(function(event) {
    *         // notify progression
    *         console.info(event.request._url, '>> progress >>',  event.percent, '%');
    *     });
    * })
    * .then(function(event) {
    *     // not_found.html is loaded
    *     console.info(event.request._url, '>> loaded >>', event.response);
    * 
    *     // return result for final then
    *     return { event: event, error: false };
    * })
    * .catch(function(event) {
    *     // error loading index.html or not_found.html
    *     console.warn(event.request._url, '>> error >>', event.response);
    * 
    *     // return error for final then
    *     return { event: event, error: true };
    * })
    * .then(function(result) {
    *     // finaly ...
    *     var event    = result.event;
    *     var logType  = result.error ? 'error' : 'info';
    *     var logLabel = result.error ? 'error' : 'loaded';
    * 
    *     console[logType](event.request._url, '>>', logLabel, '>>', event.response);
    * });
    * ```
    */
    sh.network.Request = function(settings) {
        // instance factory
        if (! (this instanceof sh.network.Request)) {
            return new sh.network.Request(settings);
        }

        // default settings
        var settings = settings || {};

        /**
        * @property {String} - Request url.
        * @default ''
        * @protected
        */
        this._url = (settings.url || '').trim();

        /**
        * @property {String} - Request method.
        * @default 'GET'
        * @protected
        */
        this._method = (settings.method  || 'GET').trim().toUpperCase();

        /**
        * @property {Mixed} - Request data.
        * @default null
        * @protected
        */
        this._data = settings.data || null;

        // append data to url if not a POST method
        if (this._method !== 'POST' && this._data) {
            // stringify data object
            if (typeof this._data === 'object') {
                this._data = Object.keys(this._data).map(function(key) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(this._data[key]);
                }).join('&');
            }

            // trim data string
            this._data = this._data.trim();

            // remove the first char if it is an '?'
            if (this._data.indexOf('?') === 0) {
                this._data = this._data.substr(1);
            }

            // append '?' or '&' to the uri if not already set
            this._url += (this._url.indexOf('?') === -1) ? '?' : '&';

            // append data to uri
            this._url += this._data;

            // reset data
            this._data = null;
        }

        /**
        * @property {Object} - Request headers.
        * @default {}
        * @protected
        */
        this._headers = settings.headers || {};

        /**
        * @property {Integer} - Request timeout in milliseconds.
        * @default 5000
        * @protected
        */
        this._timeout = settings.timeout === undefined ? 5000 : settings.timeout;

        /**
        * @property {XMLHttpRequest} - XMLHttpRequest instance.
        * @protected
        */
        this._xhr = settings.xhr || null;

        // create XMLHttpRequest instance
        var xhrOptions = {};

        if (! (this._xhr instanceof XMLHttpRequest)) {
            // maybe properties/methods to overwrite
            if (this._xhr && typeof this._xhr === 'object') {
                xhrOptions = this._xhr;
            }

            // create http request object
            this._xhr = new XMLHttpRequest();
        }

        /**
        * @property {Promise} - Promise instance.
        * @protected
        */
        this._promise = this._execute(xhrOptions);
    };

    /**
    * Execute the request and return a Promise.
    *
    * @method
    *
    * @param {Object} xhrOptions An object of `XMLHttpRequest` settings.
    *
    * @protected
    *
    * @return {Promise}
    */
    sh.network.Request.prototype._execute = function(xhrOptions) {
        // self alias
        var self = this;

        // create and return the Promise
        return new Promise(function(resolve, reject) {
            // open the request (async)
            self._xhr.open(self._method, self._url, true);

            // overwrite properties/methods
            for (var option in xhrOptions) {
                if (option === 'upload') {
                    for (var event in xhrOptions[option]) {
                        if (self._xhr.upload[event] !== undefined) {
                            self._xhr.upload[event] = xhrOptions[option][event];
                        }
                    }
                }
                else if (self._xhr[option] !== undefined) {
                    self._xhr[option] = xhrOptions[option];
                }
            }

            // force timeout
            self._xhr.timeout = self._timeout;

            // on load
            self._xhr.onload = function () {
                if (self._xhr.status >= 200 && self._xhr.status < 300) {
                    resolve(sh.network.RequestEvent('load', self));
                }
                else {
                    reject(sh.network.RequestEvent('load', self));
                }
            };

            // on error
            self._xhr.onerror = function () {
                reject(sh.network.RequestEvent('error', self));
            };

            // on timeout
            self._xhr.ontimeout = function () {
                reject(sh.network.RequestEvent('timeout', self));
            };

            // on abort
            self._xhr.onabort = function () {
                reject(sh.network.RequestEvent('abort', self));
            };

            // on upload.load
            // self._xhr.upload.onload = function () {
            //     if (self._xhr.status >= 200 && self._xhr.status < 300) {
            //         resolve(sh.network.RequestEvent('upload.load', self));
            //     }
            //     else {
            //         reject(sh.network.RequestEvent('upload.load', self));
            //     }
            // };

            // on upload.error
            self._xhr.upload.onerror = function () {
                reject(sh.network.RequestEvent('upload.error', self));
            };

            // on upload.timeout
            self._xhr.upload.ontimeout = function () {
                reject(sh.network.RequestEvent('upload.timeout', self));
            };

            // on upload.abort
            self._xhr.upload.onabort = function () {
                reject(sh.network.RequestEvent('upload.abort', self));
            };

            // set request headers
            for (var header in self._headers) {
                self._xhr.setRequestHeader(header, self._headers[header]);
            }

            // send the request
            self._xhr.send(self._method === 'POST' ? self._data : null);
        });
    };

    /**
    * Register progress event handler.
    *
    * @method
    *
    * @param {Function} progressHandler An function receiving an {@link sh.network.ProgressEvent} as first parameter.
    * @param {Object}   [context]       The callback context
    *
    * @return {this}
    */
    sh.network.Request.prototype.onProgress = function(progressHandler, context) {
        // self alias
        var self = this;

        // register progress event
        this._xhr.onprogress = function(event) {
            if (event.lengthComputable) {
                progressHandler.call(context || this, sh.network.ProgressEvent('progress', self, event));
            }
        };

        // return the promise
        return this;
    };

    /**
    * Register upload progress event handler.
    *
    * @method
    *
    * @param {Function} progressHandler An function receiving an {@link sh.network.ProgressEvent} as first parameter.
    * @param {Object}   [context]       The callback context
    *
    * @return {this}
    */
    sh.network.Request.prototype.onUploadProgress = function(progressHandler, context) {
        // self alias
        var self = this;

        // register upload progress event
        this._xhr.upload.onprogress = function(event) {
            if (event.lengthComputable) {
                progressHandler.call(context || this, sh.network.ProgressEvent('upload.progress', self, event));
            }
        };

        // return the promise
        return this;
    };

    /**
    * Appends fulfillment and rejection handlers to the promise.
    *
    * @method
    *
    * @param {Function} onFulfilled Fulfillment callback.
    * @param {Function} onRejected  Rejection callback.
    *
    * @return {Promise}
    */
    sh.network.Request.prototype.then = function(onFulfilled, onRejected) {
        return this._promise.then(onFulfilled, onRejected);
    };

    /**
    * Appends a rejection handler callback to the promise.
    *
    * @method
    *
    * @param {Function} onRejected Rejection callback.
    *
    * @return {Promise}
    */
    sh.network.Request.prototype.catch = function(onRejected) {
        return this._promise.catch(onRejected);
    };

    /**
    * Make and return an GET `sh.network.Request`.
    *
    * @function
    *
    * @param {Object}  settings                  Request settings.
    * @param {String}  settings.url              URL with protocol.
    * @param {Mixed}   [settings.data    = null] Data to send with the request.
    * @param {Object}  [settings.headers = null] Headers to send with the request.
    * @param {Integer} [settings.timeout = 5000] Timeout for this request in milliseconds.
    * @param {Object}  [settings.xhr     = null] An `XMLHttpRequest` instance or an collection of `XMLHttpRequest` properties/methods to overwrite.
    *
    * @return {sh.network.Request}
    *
    * @see Please see {@link sh.network.Request} for uses examples.
    */
    sh.network.get = function(settings) {
        // defaults settings
        settings = settings || {};

        // force GET method
        settings.method = 'GET';

        // create and return the request
        return sh.network.Request(settings);
    };

    /**
    * Make and return an POST `sh.network.Request`.
    *
    * @function
    *
    * @param {Object}  settings                  Request settings.
    * @param {String}  settings.url              URL with protocol.
    * @param {Mixed}   [settings.data    = null] Data to send with the request.
    * @param {Object}  [settings.headers = null] Headers to send with the request.
    * @param {Integer} [settings.timeout = 5000] Timeout for this request in milliseconds.
    * @param {Object}  [settings.xhr     = null] An `XMLHttpRequest` instance or an collection of `XMLHttpRequest` properties/methods to overwrite.
    *
    * @return {sh.network.Request}
    *
    * @see Please see {@link sh.network.Request} for uses examples.
    */
    sh.network.post = function(settings) {
        // defaults settings
        settings = settings || {};

        // force POST method
        settings.method = 'POST';

        // create and return the request
        return sh.network.Request(settings);
    };

    /**
    * Network scanner.
    *
    * @class
    *
    * @param {Object}       settings         Scanner settings.
    * @param {String|Array} settings.input   Ip's scan pattern. See {@link sh.network.Scanner#setInput|setInput} for details.
    * @param {Integer}      settings.timeout Scan timeout in milliseconds. See {@link sh.network.Scanner#setTimeout|setTimeout} for details.
    *
    * @example
    * ### Scanne the network
    * ```
    * // create the scanner instance
    * var scanner = sh.network.Scanner();
    * 
    * // register events callbacks
    * scanner.on('start', function(scan) {
    *     console.log('scan:', 'start:', scan.total);
    * });
    * 
    * scanner.on('pause', function(scan) {
    *     console.log('scan:', 'pause:', scan.scanned, '/', scan.total);
    * });
    * 
    * scanner.on('resume', function(scan) {
    *     console.log('scan:', 'resume:', scan.scanned, '/', scan.total);
    * });
    * 
    * scanner.on('stop', function(scan) {
    *     console.log('scan:', 'stop:', scan.scanned, '/', scan.total);
    * });
    * 
    * scanner.on('progress', function(scan) {
    *     console.log('scan:', 'progress:', scan.scanned, '/', scan.total);
    * });
    * 
    * scanner.on('board', function(scan, board) {
    *     console.log('scan:', 'board:', board);
    * });
    * 
    * scanner.on('end', function(scan) {
    *     console.log('scan:', 'end:', scan.scanned, '/', scan.total);
    *     console.log('scan:', 'found:', scan.found, '/', scan.total);
    * });
    * 
    * // start scan
    * scanner.start('192.168.1.100-115');
    * ```
    */
    sh.network.Scanner = function(settings) {
        // instance factory
        if (! (this instanceof sh.network.Scanner)) {
            return new sh.network.Scanner(settings);
        }

        // defaults settings
        settings = settings || {};

        /**
        * @property {Object} - Registred callbacks.
        * @protected
        */
        this._on = {};

        /**
        * @property {String} input Input to scan.
        * @default 192.168.1.*.
        * @readonly
        */
        this.input = settings.input || '192.168.1.*';

        /**
        * @property {Array} queue Ip's queue to scann.
        * @readonly
        */
        this.queue = [];

        /**
        * @property {Integer} timeout Default scan response timeout in milliseconds.
        * @default 2000
        * @readonly
        */
        this.timeout = settings.timeout === undefined ? 2000 : settings.timeout;

        /**
        * @property {Integer} boardTimeout Default board response timeout in milliseconds.
        * @default 1000
        * @readonly
        */
        this.boardTimeout = settings.boardTimeout === undefined ? 5000 : settings.boardTimeout;

        /**
        * @property {Boolean} scanning Is scanning.
        * @readonly
        */
        this.scanning = false;

        /**
        * @property {Boolean} aborted Aborted scann status.
        * @readonly
        */
        this.aborted = false;

        /**
        * @property {Integer} total Total number of ip to scan.
        * @readonly
        */
        this.total = 0;

        /**
        *@property {Integer} scanned Number of ip scanned.
        * @readonly
        */
        this.scanned = 0;

        /**
        * @property {Integer} found Number of boards found.
        * @readonly
        */
        this.found = 0;

        /**
        * @property {Object} boards Known boards list.
        * @readonly
        */
        this.boards = {};

    };

    // -------------------------------------------------------------------------

    /**
    * On scan start callback.
    *
    * @callback sh.network.Scanner~onStart
    *
    * @param {sh.network.Scanner} scanner Scanner instance.
    */

    /**
    * On scan pause callback.
    *
    * @callback sh.network.Scanner~onPause
    *
    * @param {sh.network.Scanner} scanner Scanner instance.
    */

    /**
    * On scan resume callback.
    *
    * @callback sh.network.Scanner~onResume
    *
    * @param {sh.network.Scanner} scanner Scanner instance.
    */

    /**
    * On scan stop callback.
    *
    * @callback sh.network.Scanner~onStop
    *
    * @param {sh.network.Scanner} scanner Scanner instance.
    */

    /**
    * On board found callback.
    *
    * @callback sh.network.Scanner~onBoard
    *
    * @param {sh.network.Scanner} scanner Scanner instance.
    * @param {sh.Board}           board   Board instance.
    */

    /**
    * On scan end callback.
    *
    * @callback sh.network.Scanner~onEnd
    *
    * @param {sh.network.Scanner} scanner Scanner instance.
    */

    // -------------------------------------------------------------------------

    /**
    * Register an event callback.
    *
    * @method
    *
    * @param {String}   event    Event name.
    * @param {Function} callback Function to call on event is fired.
    *
    * @return {this}
    *
    * @callbacks
    * | Name   | Type                                         | Description                |
    * | -------| -------------------------------------------- | -------------------------- |
    * | start  | {@link sh.network.Scanner~onStart|onStart}   | Called before scan start.  |
    * | pause  | {@link sh.network.Scanner~onPause|onPause}   | Called after scan pause.   |
    * | resume | {@link sh.network.Scanner~onResume|onResume} | Called before scan resume. |
    * | stop   | {@link sh.network.Scanner~onStop|onStop}     | Called after scan stop.    |
    * | stop   | {@link sh.network.Scanner~onBoard|onBoard}   | Called after board found.  |
    * | stop   | {@link sh.network.Scanner~onEnd|onEnd}       | Called after scan end.     |
    */
    sh.network.Scanner.prototype.on = function(event, callback) {
        // register callback
        this._on[event] = callback;

        // -> this (chainable)
        return this;
    };

    /**
    * Trigger an user defined callback with the scope of this class.
    *
    * @method
    * @protected
    *
    * @param {String} event Event name.
    * @param {Array}  args  Arguments to pass to the callback.
    *
    * @return {this}
    */
    sh.network.Scanner.prototype._trigger = function(name, args) {
        // if defined, call user callback
        this._on[name] && this._on[name].apply(this, args || []);

        // -> this (chainable)
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
    *
    * @param {String|Array} input Ip's scan pattern.
    *
    * @return {this}
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
    *
    * @method
    *
    * @param {Integer} timeout Scan timeout in milliseconds [min: 100, max: 2000].
    *
    * @return {this}
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
    *
    * @method
    * @protected
    *
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

        // increment scanned counter
        this.scanned++;

        // self alias
        var self  = this;

        try {
            // create board instance
            var board = sh.Board({
                address: address,
                timeout: this.timeout
            });

            // get board version
            board.version().then(function(event) {
                // increment counters
                self.found++;

                // add the board
                self.boards[address] = event.board;

                // set board default timeout
                event.board.timeout = self.boardTimeout;

                // trigger board event
                self._trigger('board', [self, event.board]);
            })
            .catch(function(event) {
                // return event
                return event;
            })
            .then(function(event) {
                // trigger progress event
                self._trigger('progress', [self]);

                // process queue
                self._processQueue();
            });
        }
        catch(error) {
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
    *
    * @param {String|Array} input   Ip's scan pattern. See {@link sh.network.Scanner#setInput|setInput} for details.
    * @param {Integer}      timeout Scan timeout in milliseconds. See {@link sh.network.Scanner#setTimeout|setTimeout} for details.
    *
    * @return {this}
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

        // -> this (chainable)
        return this;
    };

    /**
    * Stop current scan.
    *
    * @method
    *
    * @return {this}
    */
    sh.network.Scanner.prototype.stop = function() {
        if (this.scanning || this.aborted) {
            // set scan status
            this.scanning = false;
            this.aborted  = false;

            // call user callback
            this._trigger('stop', [this]);
        }

        // -> this (chainable)
        return this;
    };

    /**
    * Pause current scan.
    *
    * @method
    *
    * @return {this}
    */
    sh.network.Scanner.prototype.pause = function() {
        if (this.scanning) {
            // set scan status
            this.scanning = false;
            this.aborted  = true;

            // call user callback
            this._trigger('pause', [this]);
       }

        // -> this (chainable)
        return this;
    };

    /**
    * Resume current scan.
    *
    * @method
    *
    * @return {this}
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

        // -> this (chainable)
        return this;
    };

    /**
    * Custom board event.
    *
    * @class
    *
    * @param {String}                  name  Event name.
    * @param {sh.Board}                board Board instance.
    * @param {sh.network.RequestEvent} event Original `sh.network.RequestEvent` instance.
    * @param {Object|null}             data  Event data (depending on the command).
    */
    sh.BoardEvent = function(name, board, event, data) {
        // instance factory
        if (! (this instanceof sh.BoardEvent)) {
            return new sh.BoardEvent(name, board, event, data);
        }

        /** @property  {String}  -  Event name. */
        this.name = name;

        /** @property  {sh.Board}  -  Board instance. */
        this.board = board;

        /** @property  {Object|null}  -  Event data (depending on the command). */
        this.data = data || null;

        /** @property  {sh.network.RequestEvent}  -  Original `sh.network.RequestEvent` instance. */
        this.originalEvent = event;
    };

    /**
    * Board class.
    *
    * @class
    *
    * @param {String|Object} address|settings         Board ip or hostname.
    * @param {Object}        [settings]               Board settings.
    * @param {String}        [settings.address]       Board ip or hostname.
    * @param {Integer}       [settings.timeout]       Response timeout in milliseconds.
    * @param {Integer}       [settings.watchInterval] Watch interval in milliseconds.
    * @param {Integer}       [settings.watchTimeout]  Watch timeout in milliseconds.
    *
    * @example
    * ### Board class usage
    * ```
    * // create the board instance
    * var board = sh.Board('192.168.1.102');
    * ```
    */
    sh.Board = function(address, settings) {
        // defaults settings
        settings = settings || {};

        // settings provided on first argument
        if (typeof address === 'object') {
            settings = address;
            address  = settings.address;
        }

        // invalid address type
        if (typeof address !== 'string') {
            throw new Error('Address must be a string.');
        }

        // Trim whitespaces
        address = address.trim();

        // address not provided or too short
        if (!address || address.length <= 4) {
            throw new Error('Address too short [min.: 4].');
        }

        // instance factory
        if (! (this instanceof sh.Board)) {
            return new sh.Board(address, settings);
        }

        /**
        * @property {String} address Board ip or hostname.
        * @readonly
        */
        this.address = address;

        /**
        * @property {String} id Board ip or hostname as DOM id.
        * @readonly
        */
        this.id = address.replace(/[^0-9a-z_\-]+/gi, '-');

        /**
        * @property {Integer} timeout Default response timeout in milliseconds.
        * @default 5000
        * @readonly
        */
        this.timeout = settings.timeout !== undefined ? settings.timeout : 5000;

        /**
        * @property {Object|null} info        Board info parsed from version command.
        * @property {String}      info.branch Firmware branch.
        * @property {String}      info.hash   Firmware hash.
        * @property {String}      info.date   Firmware date.
        * @property {String}      info.mcu    Board MCU.
        * @property {String}      info.clock  Board clock freqency.
        * @default
        *
        * @readonly
        */
        this.info = null;

        /**
        * @property {Boolean} online Is board online.
        * @default
        * @readonly
        */
        this.online = false;

        /**
        * @property {Integer} lastOnlineTime Last time the board was seen online.
        * @default
        * @readonly
        */
        this.lastOnlineTime = null;

        /**
        * @property {Boolean} online Is board connected.
        * @default
        * @readonly
        */
        this.connected = false;

        /**
        * @property {Integer} watchTimeoutId Connection timer id.
        * @default
        * @readonly
        */
        this.watchTimeoutId = null;

        /**
        * @property {Integer} watchInterval Connection timer interval.
        * @default 5000
        * @readonly
        */
        this.watchInterval = settings.watchInterval || 5000;

        /**
        * @property {Integer} watchInterval Connection timeout interval.
        * @default 2000
        * @readonly
        */
        this.watchTimeout = settings.watchTimeout || 2000;

        /**
        * @property {Integer} reconnectAttempts Number of reconnection attempts.
        * @default
        * @readonly
        */
        this.reconnectAttempts = 0;

        /**
        * @property {Integer} connections Number of successful connections from the first connection.
        * @default
        * @readonly
        */
        this.connections = 0;

        /**
        * @property {Integer} reconnections Number of successful reconnections from the last connection.
        * @default
        * @readonly
        */
        this.reconnections = 0;

        /**
        * @property {Object} - Registred callbacks.
        * @protected
        */
        this._on = {};
    };

    // -------------------------------------------------------------------------

    /**
    * On request response.
    *
    * @callback sh.Board~onResponse
    *
    * @param {sh.BoardEvent} event Board event.
    */

    /**
    * On request error.
    *
    * @callback sh.Board~onError
    *
    * @param {sh.BoardEvent} event Board event.
    */

    /**
    * On board connect.
    *
    * @callback sh.Board~onConnect
    *
    * @param {sh.BoardEvent} event Board event.
    */

    /**
    * On board disconnect.
    *
    * @callback sh.Board~onDisconnect
    *
    * @param {sh.BoardEvent} event Board event.
    */

    /**
    * On board reconnect.
    *
    * @callback sh.Board~onReconnect
    *
    * @param {sh.BoardEvent} event Board event.
    */

    /**
    * On board redisconnect.
    *
    * @callback sh.Board~onRedisconnect
    *
    * @param {sh.BoardEvent} event Board event.
    */

    /**
    * On watch board.
    *
    * @callback sh.Board~onWatch
    *
    * @param {sh.BoardEvent} event Board event.
    */

    // -------------------------------------------------------------------------

    /**
    * Register an event callback.
    *
    * @method
    *
    * @param {String}   event    Event name.
    * @param {Function} callback Function to call on event is fired.
    *
    * @return {this}
    *
    * @callbacks
    * | Name         | Type                                           | Description                   |
    * | ------------ | ---------------------------------------------- | ----------------------------- |
    * | response     | {@link sh.Board~onResponse|onResponse}         | Called on request response.   |
    * | error        | {@link sh.Board~onError|onError}               | Called on request error.      |
    * | connect      | {@link sh.Board~onConnect|onConnect}           | Called on board connect.      |
    * | disconnect   | {@link sh.Board~onDisconnect|onDisconnect}     | Called on board disconnect.   |
    * | reconnect    | {@link sh.Board~onReconnect|onReconnect}       | Called on board reconnect.    |
    * | redisconnect | {@link sh.Board~onRedisconnect|onRedisconnect} | Called on board redisconnect. |
    * | watch        | {@link sh.Board~onWatch|onWatch}               | Called on watch board.        |
    */
    sh.Board.prototype.on = function(event, callback) {
        // init callback section
        if (! this._on[event]) {
            this._on[event] = [];
        }

        // register callback
        if (this._on[event].indexOf(callback) === -1) {
            this._on[event].push(callback);
        }

        // -> this (chainable)
        return this;
    };

    /**
    * Trigger an user defined callback with the scope of this class.
    *
    * @method
    * @protected
    *
    * @param {String} name  Event name.
    * @param {String} event Original event.
    * @param {Mixed}  data  Event data.
    *
    * @return {sh.BoardEvent}
    */
    sh.Board.prototype._trigger = function(name, event, data) {
        // to board event
        event = sh.BoardEvent(name, this, event, data);

        // call user callback with the scope of this instance
        var callbacks = this._on[name] || [];

        for (var i = 0; i < callbacks.length; i++) {
            callbacks[i].call(this, event);
        }

        // return the board event
        return event;
    };

    // -------------------------------------------------------------------------

    /**
    * Watch periodicaly if the board is online.
    *
    * @protected
    * @method
    */
    sh.Board.prototype._watchConnection = function() {
        // not connected
        if (! this.connected) {
            throw new Error('Not connected.');
        }

        // next interval offset
        var intervalOffset = Date.now() - this.lastOnlineTime;

        // next interval timeout
        var nextInterval = this.watchInterval;

        // adjust interval (save some request, anti flood)
        if (intervalOffset < this.watchInterval) {
            nextInterval += intervalOffset;
        }

        // self alias
        var self = this;

        // new timeout
        this.watchTimeoutId = setTimeout(function() {
            // board online status before ping
            var online = self.online;

            // send ping command
            self.ping(self.watchTimeout).then(function(event) {
                // if online flag as changed
                if (! online) {
                    // reset reconnection attempts
                    self.reconnectAttempts = 0;

                    // increment reconnections counter
                    self.reconnections++;

                    // trigger events
                    self._trigger('connect', event);
                    self._trigger('reconnect', event);
                }

                // return the event
                return event;
            })
            .catch(function(event) {
                // if online flag as changed
                if (! online) {
                    // increment reconnection attempts
                    self.reconnectAttempts++;
                    self._trigger('reconnectAttempt', event, {
                        attempts: self.reconnectAttempts
                    });
                }
                else {
                    // trigger events
                    self._trigger('disconnect', event);

                    if (self.reconnections > 0) {
                        self._trigger('redisconnect', event);
                    }
                }

                // return the event
                return event;
            })
            .then(function(event) {
                // not connected
                if (! self.connected) {
                    // stop watching
                    return null;
                }

                // trigger watch event
                self._trigger('watch', event);

                // next connection watch
                self._watchConnection();
            });

        }, nextInterval);
    };

    /**
    * Connect the board (watch periodicaly if the board is online).
    *
    * @method
    *
    * @param {Integer} [timeout] Connection timeout.
    *
    * @return {sh.network.Request}
    *
    * @example
    * ### Board connection
    * ```
    * // create the board instance
    * var board = sh.Board('192.168.1.102');
    * 
    * // register some events callbacks
    * board.on('connect', function(event) {
    *     console.info('on.connect:', event.board);
    * })
    * .on('disconnect', function(event) {
    *     console.info('on.disconnect:', event.board);
    * })
    * .on('reconnect', function(event) {
    *     console.info('on.reconnect:', event.board);
    * })
    * .on('redisconnect', function(event) {
    *     console.info('on.redisconnect:', event.board);
    * })
    * .on('reconnectAttempt', function(event) {
    *     console.info('on.reconnectAttempt:', event.data.attempts, event.board);
    *     // disconnect the board after 5 attempts
    *     if (this.reconnectAttempts == 2) {
    *         this.disconnect().then(function(event) {
    *             console.info('disconnect:', event.board);
    *         })
    *         .catch(function(event) {
    *             console.error('disconnect:', event.name, event);
    *         });
    *     }
    * })
    * .on('watch', function(event) {
    *     console.info('on.watch:', event.board);
    * })
    * .on('response', function(event) {
    *     console.info('on.response:', event.board);
    * })
    * .on('error', function(event) {
    *     console.error('on.error:', event.board);
    * });
    * 
    * // connect the board
    * board.connect().then(function(event) {
    *     console.info('connect:', event.board);
    * })
    * .catch(function(event) {
    *     console.error('connect:', event.name, event);
    * });
    * ```
    */
    sh.Board.prototype.connect = function(timeout) {
        // already connected
        if (this.connected) {
            throw new Error('Already connected.');
        }

        // reset reconnection attempts
        this.reconnectAttempts = 0;

        // self alias
        var self = this;

        // get board version
        return this.version(timeout).then(function(event) {
            // set connected flag
            self.connected = true;

            // reset reconnection counter
            self.reconnections = 0;

            // increment connections counter
            self.connections++;

            // start watching
            self._watchConnection();

            // trigger event
            var board_event = self._trigger('connect', event);

            // resolve the promise
            return Promise.resolve(board_event);
        });
    };

    /**
    * Disconnect the board (stop watching periodicaly if the board is online).
    *
    * @method
    * @return {Promise}
    *
    * @example
    * ### Board disconnection
    * ```
    * // create the board instance
    * var board = sh.Board('192.168.1.102');
    * 
    * // connect the board
    * board.connect().then(function(event) {
    *     console.info('connect:', event.board);
    * })
    * .catch(function(event) {
    *     console.error('connect:', event.name, event);
    * });
    * 
    * // disconnect the board after 15 seconds
    * setTimeout(function() {
    * 
    *     board.disconnect().then(function(event) {
    *         console.info('disconnect:', event.board);
    *     })
    *     .catch(function(event) {
    *         console.error('disconnect:', event.name, event);
    *     });
    * 
    * }, 15000); // 15 sec.
    * ```
    */
    sh.Board.prototype.disconnect = function() {
        // not connected
        if (! this.connected) {
            throw new Error('Not connected.');
        }

        // stop watching the connection
        clearTimeout(this.watchTimeoutId);
        this.watchTimeoutId = null;

        // set connected flag
        this.connected = false;

        // trigger event
        var board_event = this._trigger('disconnect');

        // resolve the promise
        return Promise.resolve(board_event);
    };

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
    * @example
    * ### Send arbitrary command(s)
    * ```
    * // create the board instance
    * var board = sh.Board('192.168.1.102');
    * 
    * // get board version (raw)
    * board.command('version').then(function(event) {
    *     console.info('board:', event.board);                        // Board instance
    *     console.info('version:', event.originalEvent.response.raw); // Raw response text
    * })
    * .catch(function(event) {
    *     console.error('version:', event.name, event);
    * });
    * ```
    */
    sh.Board.prototype.command = function(command, timeout) {
        // default response timeout
        if (timeout === undefined) {
            timeout = this.timeout;
        }

        // self alias
        var self = this;

        // clean command
        command = command.trim() + '\n';

        // trigger event
        self._trigger('command', null, command);

        // return POST request (promise)
        return sh.network.post({
            url    : 'http://' + this.address + '/command',
            data   : command,
            timeout: timeout
        })
        .then(function(event) {
            // set online flag
            self.online = true;

            // set last online time
            self.lastOnlineTime = Date.now();

            if (event.response.raw.indexOf('error:Unsupported command') === 0) {
                // reject the promise
                var message = event.response.raw.substr(6);
                return Promise.resolve(self._trigger('error', event, message));
            }

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
    * @example
    * ### Ping the board
    * ```
    * // create the board instance
    * var board = sh.Board('192.168.1.102');
    * 
    * board.ping().then(function(event) {
    *     console.info('ping:', event.name, event);
    * })
    * .catch(function(event) {
    *     console.error('ping:', event.name, event);
    * });
    * ```
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
    * @example
    * ### Get the board version
    * ```
    * // create the board instance
    * var board = sh.Board('192.168.1.102');
    * 
    * // get board version (parsed)
    * board.version().then(function(event) {
    *     console.info('board:', event.board); // Board instance
    *     console.info('info:', event.data);   // {branch, hash, date, mcu, clock}
    * })
    * .catch(function(event) {
    *     console.error('version:', event.name, event);
    * });
    * ```
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
    * @example
    * ### List files
    * ```
    * // create the board instance
    * var board = sh.Board('192.168.1.102');
    * 
    * // get all files or directories on sd/gcode
    * board.ls('sd/gcode/').then(function(event) {
    *     console.info('ls:', event.name, event.data);
    * })
    * .catch(function(event) {
    *     console.error('ls:', event.name, event);
    * });
    * ```
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
    * @example
    * ### List all files (recursive)
    * ```
    * // create the board instance
    * var board = sh.Board('192.168.1.102');
    * 
    * // get all files or directories on sd/gcode (recursive)
    * board.lsAll('/sd/gcode/').then(function(event) {
    *     console.info('lsAll:', event.name, event.data);
    * })
    * .catch(function(event) {
    *     console.error('lsAll:', event.name, event);
    * });
    * ```
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
    * @example
    * ### Move file
    * ```
    * // create the board instance
    * // var board = sh.Board('192.168.1.102');
    * //
    * // board.mv('/sd/source.gcode', '/sd/target/source.gcode').then(function(event) {
    * //     console.info('mv:', event.name, event);
    * // })
    * // .catch(function(event) {
    * //     console.error('mv:', event.name, event);
    * // });
    * ```
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
    * @example
    * ### Remove file(s)
    * ```
    * // create the board instance
    * var board = sh.Board('192.168.1.102');
    * 
    * // remove one file
    * board.rm('/sd/target/source.gcode').then(function(event) {
    *     console.info('rm:', event.name, event);
    * })
    * .catch(function(event) {
    *     console.error('rm:', event.name, event);
    * });
    * 
    * // remove several files
    * var paths = ['/sd/file1.gcode', '/sd/file2.gcode'];
    * 
    * board.rm(paths).then(function(event) {
    *     console.info('rm:', event.name, event);
    * })
    * .catch(function(event) {
    *     console.error('rm:', event.name, event);
    * });
    * ```
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
    * @example
    * ### Upload a file
    * ```
    * // create the board instance
    * var board = sh.Board('192.168.1.102');
    * 
    * // upload from string
    * var name1 = 'file1.gcode';
    * var file1 = 'File1 contents...';
    * 
    * board.upload(file1, name1).onUploadProgress(function(event) {
    *     console.info(board.address, '>> upload >>',  event.percent, '%');
    * })
    * .then(function(event) {
    *     console.info('upload:', event.name, event);
    * 
    *     // get the first 10 lines
    *     board.cat('/sd/' + name1, 10).then(function(event) {
    *         console.info('cat:', event.name, event);
    *     })
    *     .catch(function(event) {
    *         console.error('cat:', event.name, event);
    *     });
    * })
    * .catch(function(event) {
    *     console.error('upload:', event.name, event);
    * });
    * 
    * // upload from Blob object (do not forget the EOF '\n')
    * var name2 = 'file2.gcode';
    * var file2 = new Blob(['File2 contents...\n'], { type: 'text/plain' });
    * 
    * board.upload(file2, name2).onUploadProgress(function(event) {
    *     console.info(board.address, '>> upload >>',  event.percent, '%');
    * })
    * .then(function(event) {
    *     console.info('upload:', event.name, event);
    * 
    *     // get the first 10 lines
    *     board.cat('/sd/' + name2, 10).then(function(event) {
    *         console.info('cat:', event.name, event);
    *     })
    *     .catch(function(event) {
    *         console.error('cat:', event.name, event);
    *     });
    * })
    * .catch(function(event) {
    *     console.error('upload:', event.name, event);
    * });
    * 
    * // upload from File object
    * // create input element
    * var input  = document.createElement('input');
    * input.type = 'file';
    * document.body.appendChild(input);
    * 
    * input.addEventListener('change', function(event) {
    *     var file3 = event.target.files[0];
    * 
    *     board.upload(file3).onUploadProgress(function(event) {
    *         console.info(board.address, '>> upload >>',  event.percent, '%');
    *     })
    *     .then(function(event) {
    *         console.info('upload:', event.name, event);
    * 
    *         // get the first 10 lines
    *         board.cat('/sd/' + file3.name, 10).then(function(event) {
    *             console.info('cat:', event.name, event);
    *         })
    *         .catch(function(event) {
    *             console.error('cat:', event.name, event);
    *         });
    *     })
    *     .catch(function(event) {
    *         console.error('upload:', event.name, event);
    *     });
    * });
    * ```
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
    * @example
    * ### Get file contents
    * ```
    * // create the board instance
    * var board = sh.Board('192.168.1.102');
    * 
    * // get the first 10 lines of config.txt
    * board.cat('/sd/config.txt', 10).then(function(event) {
    *     console.info('cat:', event.name, event);
    * })
    * .catch(function(event) {
    *     console.error('cat:', event.name, event);
    * });
    * ```
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
    * @example
    * ### Get position
    * ```
    * // create the board instance
    * var board = sh.Board('192.168.1.102');
    * 
    * board.pos().then(function(event) {
    *     var pos = event.data;
    * 
    *     console.info('pos:', event.name, pos);
    *     console.info('pos:', pos.get('REALTIME_WPOS'));
    *     console.info('pos:', pos.get('REALTIME_WPOS', 'Y'));
    * })
    * .catch(function(event) {
    *     console.error('pos:', event.name, event);
    * });
    * ```
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

    /**
    * Handle an configuration value.
    *
    * @class
    *
    * @param {String} value The value as string.
    */
    sh.BoardConfigValue = function(value) {
        // instance factory
        if (! (this instanceof sh.BoardConfigValue)) {
            return new sh.BoardConfigValue(value);
        }

        /**
        * @property {String}
        * @protected
        */
        this._lastValue = null;

        /**
        * @property {String}
        * @protected
        */
        this._currentValue = null;

        this.set(value);

        /**
        * @property {String}
        * @protected
        */
        this._firstValue = this._currentValue;
    };

    /**
    * Set new value.
    *
    * @method
    *
    * @param {String} value The new value.
    *
    * @return {String} The old value.
    */
    sh.BoardConfigValue.prototype.set = function(value) {
        if (typeof value != 'string') {
            throw new Error('The value must be a string.');
        }

        value = value.trim();

        this._lastValue    = this._currentValue || value;
        this._currentValue = value;

        return this._lastValue;
    };

    /**
    * Test if the value is modified.
    *
    * @method
    * @return {Boolean}
    */
    sh.BoardConfigValue.prototype.isModified = function() {
        return this._currentValue !== this._firstValue;
    };

    /**
    * Set value from first value.
    *
    * @method
    * @return {String} The old value.
    */
    sh.BoardConfigValue.prototype.setFromFirstValue = function() {
        return this.set(this._firstValue);
    };

    /**
    * Set value from last value.
    *
    * @method
    * @return {String} The old value.
    */
    sh.BoardConfigValue.prototype.setFromLastValue = function() {
        return this.set(this._lastValue);
    };

    /**
    * Get current value as string.
    *
    * @method
    * @return {String}
    */
    sh.BoardConfigValue.prototype.get = function() {
        return this._currentValue;
    };

    /**
    * Get first value as string.
    *
    * @method
    * @return {String}
    */
    sh.BoardConfigValue.prototype.getFirstValue = function() {
        return this._firstValue;
    };

    /**
    * Get last value as string.
    *
    * @method
    * @return {String}
    */
    sh.BoardConfigValue.prototype.getLastValue = function() {
        return this._lastValue;
    };

    /**
    * Get current value as string.
    *
    * @method
    * @return {String}
    */
    sh.BoardConfigValue.prototype.toString = function() {
        return this.get();
    };

    /**
    * Get current value as integer.
    *
    * @method
    * @return {Integer}
    */
    sh.BoardConfigValue.prototype.toInteger = function() {
        return parseInt(this._currentValue);
    };

    /**
    * Get current value as float.
    *
    * @method
    * @return {Float}
    */
    sh.BoardConfigValue.prototype.toFloat = function(decimals) {
        var floatValue = parseFloat(this._currentValue);

        if (decimals === undefined) {
            return floatValue;
        }

        return Number(floatValue.toFixed(decimals));
    };

    /**
    * Handle an configuration item.
    *
    * @class
    *
    * @param {String} [comments] Comments as string.
    */
    sh.BoardConfigComments = function(comments) {
        // instance factory
        if (! (this instanceof sh.BoardConfigComments)) {
            return new sh.BoardConfigComments(comments);
        }

        /**
        * @property {Array[String]}
        * @protected
        */
        this._comments = [];

        this.comments(comments || '');
    };

    /**
    * Get/Set/Append comments.
    *
    * @method
    *
    * @param {String}  [comments]     Comments as string.
    * @param {Boolean} [append=false] If true append the comments.
    *
    * @return {Array}
    */
    sh.BoardConfigComments.prototype.comments = function(comments, append) {
        if (comments === undefined) {
            return this._comments;
        }

        if (typeof comments != 'string') {
            throw new Error('The comments must be a string.');
        }

        if (! append) {
            this._comments = [];
        }

        var lines = comments.trim().split('\n');

        return this._comments = this._comments.concat(lines);
    };

    /**
    * Handle an configuration item.
    *
    * @class
    *
    * @param {Object}  settings                  Item settings.
    * @param {String}  settings.name             Item name.
    * @param {String}  settings.value            Item value.
    * @param {String}  [settings.comments]       Item comments.
    * @param {Boolean} [settings.disabled=false] Item state.
    */
    sh.BoardConfigItem = function(settings) {
        // instance factory
        if (! (this instanceof sh.BoardConfigItem)) {
            return new sh.BoardConfigItem(settings);
        }

        /**
        * @property {String}
        * @protected
        */
        this._name = '';

        this.name(settings.name);

        /**
        * @property {sh.BoardConfigValue}
        * @protected
        */
        this._value = null;

        this.value(settings.value);

        /**
        * @property {sh.BoardConfigComments}
        * @protected
        */
        this._comments = sh.BoardConfigComments(settings.comments);

        /**
        * @property {Boolean}
        * @protected
        */
        this._disabled = false;

        this.disabled(settings.disabled);

        /**
        * @property {Boolean}
        * @protected
        */
        this._initiallyDisabled = this._disabled;
    };

    /**
    * Test if the item is modified.
    *
    * @method
    * @return {Boolean}
    */
    sh.BoardConfigItem.prototype.isModified = function() {
        return this.value().isModified() || (this.disabled() !== this._initiallyDisabled);
    };

    /**
    * Reset state (enabled/disabled)
    *
    * @method
    * @return {Boolean}
    */
    sh.BoardConfigItem.prototype.resetDisabled = function() {
        return this.disabled(this._initiallyDisabled);
    };

    /**
    * Get/Set the item name.
    *
    * @method
    *
    * @param {Boolean} [name] If provided set new name.
    *
    * @return {Boolean}
    */
    sh.BoardConfigItem.prototype.name = function(name) {
        if (name === undefined) {
            return this._name;
        }

        if (typeof name != 'string') {
            throw new Error('The name must be a string.');
        }

        return this._name = name.trim();
    };

    /**
    * Get/Set the item value.
    *
    * This method reload the item object when a new value is set,
    * if you want to keep the value state, use `value().set(newValue)`.
    *
    * @method
    *
    * @param {String} [value] If provided reload item value.
    *
    * @return {sh.BoardConfigValue}
    */
    sh.BoardConfigItem.prototype.value = function(value) {
        if (value === undefined) {
            return this._value;
        }

        return this._value = sh.BoardConfigValue(value);
    };

    /**
    * Get/Set/Append comments.
    *
    * @method
    *
    * @param {String}  [comments]     Comments as string.
    * @param {Boolean} [append=false] If true append the comments.
    *
    * @return {Array}
    */
    sh.BoardConfigItem.prototype.comments = function(comments, append) {
        return this._comments.comments(comments, append);
    };

    /**
    * Enable/Disable item.
    *
    * @method
    *
    * @param {Boolean} [state] If provided set new state.
    *
    * @return {Boolean}
    */
    sh.BoardConfigItem.prototype.disabled = function(state) {
        if (state === undefined) {
            return this._disabled;
        }

        return this._disabled = !!state;
    };

    /**
    * Handle the board configuration.
    *
    * @class
    *
    * @param {String} [filename='config'] Configuration filename.
    * @param {String} [source]            Raw configuration as string.
    */
    sh.BoardConfig = function(filename, source) {
        // instance factory
        if (! (this instanceof sh.BoardConfig)) {
            return new sh.BoardConfig(filename, source);
        }

        /**
        * @property {String}
        * @readonly
        */
        this._filename = 'config';

        /**
        * @property {String}
        * @readonly
        */
        this._source = null;

        /**
        * @property {Array}
        * @readonly
        */
        this._items = null;

        /**
        * @property {Boolean}
        * @readonly
        */
        this._loaded = false;

        // init values
        filename && this.filename(filename);
        source && this.parse(source);
    };

    /**
    * Get/Set the filename.
    *
    * @method
    *
    * @param {String} [filename] Configuration filename.
    *
    * @return {String}
    */
    sh.BoardConfig.prototype.filename = function(filename) {
        if (filename === undefined) {
            return this._filename;
        }

        if (typeof filename != 'string') {
            throw new Error('The filename must be a string.');
        }

        return this._filename = filename;
    };

    /**
    * Get the source (as provided).
    * Set and parse the source (reload).
    *
    * @method
    *
    * @param {String} [source] Raw configuration as string.
    *
    * @return {String}
    */
    sh.BoardConfig.prototype.source = function(source) {
        if (source === undefined) {
            return this._source;
        }

        this.parse(source);

        return this._source;
    };

    /**
    * Is loaded.
    *
    * @method
    * @return {Boolean}
    */
    sh.BoardConfig.prototype.isLoaded = function() {
        return this._loaded;
    };

    /**
    * Return an config item if exists.
    *
    * @method
    *
    * @param {String|sh.BoardConfigItem} key            Configuration key.
    * @param {Mixed}                     [defaultValue] Default value to return if not defined.
    *
    * @return {null|sh.BoardConfigItem[]}
    */
    sh.BoardConfig.prototype.hasItems = function(key, defaultValue) {
        if (! this.isLoaded()) {
            throw new Error('No configuration loaded.');
        }

        var items = this._items;

        if (typeof key !== 'string') {
            key = items.indexOf(key);

            return key >= 0 ? [items[key]] : defaultValue;
        }

        var item, found = [];

        for (var i = 0, il = items.length; i < il; i++) {
            item = items[i];

            if (item instanceof sh.BoardConfigComments) {
                continue;
            }

            if (item.name() === key) {
                found.push(item);
            }
        }

        return found.length ? found : defaultValue;
    };

    /**
    * Get config item(s).
    *
    * @method
    *
    * @param {String} [key]          Configuration key.
    * @param {Mixed}  [defaultValue] Default value to return if not defined.
    *
    * @return {null|sh.BoardConfigItem[]}
    * @throws {Error} If not defined and no default value provided.
    */
    sh.BoardConfig.prototype.getItems = function(key, defaultValue) {
        if (! this.isLoaded()) {
            throw new Error('No configuration loaded.');
        }

        if (key === undefined) {
            return this._items;
        }

        var items = this.hasItems(key);

        if (items) {
            return items;
        }

        if (defaultValue === undefined) {
            throw new Error('Undefined item [' + key + ']');
        }

        return defaultValue;
    };

    /**
    * Parse a configuration file.
    *
    * @method
    *
    * @param {String} source Raw configuration as string.
    *
    * @return {this}
    */
    sh.BoardConfig.prototype.parse = function(source) {
        // no source provided
        if (! source) {
            throw new Error('No source provided to parse.');
        }

        // no source provided
        if (typeof source != 'string') {
            throw new Error('The source must be a string.');
        }

        // split text on new lines
        var lines = source.trim().split('\n');

        // no source provided
        if (! lines.length) {
            throw new Error('The source is empty.');
        }

        // reset config
        this._items  = [];
        this._loaded = false;
        this._source = source;

        // skip first line (# NOTE Lines must not exceed 132 characters)
        if (lines[0].trim().indexOf('# NOTE Lines must') == 0) {
            lines.shift();
        }

        var line, matches, disabled, name, value, comments,
            lastMatch, lastItem, lastComments;

        for (var i = 0, il = lines.length; i < il; i++) {
            // current line
            line = lines[i];

            // skip empty line
            if (! line.trim().length) {
                // reset last comment
                lastComments = null;
                lastMatch    = null;

                // next item
                continue;
            }

            // extract: item (name, value, comment, disabled)
            matches = line.match(/^(#+)?([a-z0-9\.\_\-]+) ([^#]+)(.*)$/);

            if (matches) {
                // add new items
                lastMatch = lastItem = sh.BoardConfigItem({
                    disabled: matches[1],
                    name    : matches[2],
                    value   : matches[3],
                    comments: matches[4].substr(1)
                });

                name = lastItem.name();

                // add to items
                this._items.push(lastItem);

                // next item
                continue;
            }

            // extract: item comments (on next lines)
            matches = line.match(/^\s{10,}#(.*)/);

            if (matches) {
                // add comments to last item comments items
                lastItem.comments(matches[1], true);

                // next item
                continue;
            }

            // extract: section comments
            comments = line.substr(1).trim();

            if (lastComments && lastMatch instanceof sh.BoardConfigComments) {
                lastComments.comments(comments, true);
            } else {
                lastMatch = lastComments = sh.BoardConfigComments(comments);
                this._items.push(lastComments);
            }
        }

        // loaded ?
        this._loaded = !!this._items.length;

        // chainable
        return this;
    }

    /**
    * Wordwrap...
    *
    * @method
    *
    * @return {String}
    */
    sh.wordwrap = function(str, int_width, str_break, cut) {
        //  discuss at: http://phpjs.org/functions/wordwrap/
        // original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
        // improved by: Nick Callen
        // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // improved by: Sakimori
        //  revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
        // bugfixed by: Michael Grier
        // bugfixed by: Feras ALHAEK
        //   example 1: wordwrap('Kevin van Zonneveld', 6, '|', true);
        //   returns 1: 'Kevin |van |Zonnev|eld'
        //   example 2: wordwrap('The quick brown fox jumped over the lazy dog.', 20, '<br />\n');
        //   returns 2: 'The quick brown fox <br />\njumped over the lazy<br />\n dog.'
        //   example 3: wordwrap('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.');
        //   returns 3: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod \ntempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim \nveniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea \ncommodo consequat.'

        var m = ((arguments.length >= 2) ? arguments[1] : 75)
        var b = ((arguments.length >= 3) ? arguments[2] : '\n')
        var c = ((arguments.length >= 4) ? arguments[3] : false)

        var i, j, l, s, r

        str += ''

        if (m < 1) {
            return str
        }

        for (i = -1, l = (r = str.split(/\r\n|\n|\r/)).length; ++i < l; r[i] += s) {
            for (s = r[i], r[i] = ''; s.length > m; r[i] += s.slice(0, j) + ((s = s.slice(j)).length ? b : '')) {
                j = c == 2 || (j = s.slice(0, m + 1).match(/\S*(\s)?$/))[1] ? m : j.input.length - j[0].length || c == 1 && m || j.input.length + (j = s.slice(m).match(/^\S*/))[0].length
            }
        }

        return r.join('\n')
    }

    /**
    * Return the configuration as string.
    *
    * @method
    *
    * @return {String}
    */
    sh.BoardConfig.prototype.format = function() {
        // Get the items
        var items = this.getItems();

        // first pass: find name/value max lengths
        var lengths  = { name: 0, value: 0 };
        var nameLength, valueLength;

        for (var item, i = 0; i < items.length; i++) {
            // current item
            item = items[i];

            // value item
            if (item instanceof sh.BoardConfigItem) {
                nameLength  = item.name().length;
                valueLength = item.value().toString().length;

                if (item.disabled()) {
                    nameLength++;
                }

                lengths.name  = Math.max(lengths.name, nameLength);
                lengths.value = Math.max(lengths.value, valueLength);
            }
        }

        // second pass: find min paddins
        var paddings = { name: 5, value: 5, offset: 120, items: [] };
        var padding;

        for (var item, i = 0; i < items.length; i++) {
            // current item
            item = items[i];

            // value item
            if (item instanceof sh.BoardConfigItem) {
                nameLength  = item.name().length;
                valueLength = item.value().toString().length;

                if (item.disabled()) {
                    nameLength++;
                }

                padding = (lengths.name - nameLength + paddings.name);
                padding+= (lengths.value - valueLength);

                paddings.offset = Math.min(paddings.offset, padding);

                paddings.items.push(padding);
            }
            else {
                paddings.items.push(null);
            }
        }

        if (paddings.offset > paddings.name) {
            paddings.offset -= paddings.name;
        }

        // lines
        var lines = [];

        // ...
        var item, line, pads, comments;

        for (var i = 0; i < items.length; i++) {
            // current item
            item = items[i];

            // comments item
            if (item instanceof sh.BoardConfigComments) {
                i && lines.push('\n');
                line = item.comments().join(' ');
                line = sh.wordwrap(line, 120, '\n# ', true);
                line = (line[0] == '#' ? '#' : '# ') + line;
                lines.push(line);
                continue;
            }

            // current line
            line = '';

            // disabled item
            if (item.disabled()) {
                // append comments char to buffer
                line += '#';
            }

            // start with the name
            line += item.name();

            // [name <--> value] padding
            pads = paddings.items[i] - paddings.offset;

            // append padding spaces
            line += Array(pads + 1).join(' ');

            // append value
            line += item.value();

            // append padding spaces
            line += Array(paddings.value + 1).join(' ');

            // comments
            comments = item.comments().join(' ');
            pads     = lengths.name + paddings.name + lengths.value + paddings.value - paddings.offset;
            comments = sh.wordwrap(comments, 120 - pads, '\n' + Array(pads + 1).join(' ') + '# ', true);

            // append item comments to buffer
            line += '# ' + comments;

            // append line
            lines.push(line);
        }

        // return the lines as string
        return lines.join('\n');
    };

    /**
    * Return the configuration as string.
    *
    * @method
    *
    * @return {String}
    */
    sh.BoardConfig.prototype.toString = function() {
        return this.format();
    };

    /**
    * Get the board configuration.
    *
    * @method
    *
    * @param {Boolean} [txtFirst=false] Test `config.txt` first.
    * @param {Integer} [timeout=0]      Connection timeout.
    *
    * @return {Promise}
    *
    * @example
    * ### Get the configuration
    * ```
    * // create the board instance
    * var board = sh.Board('192.168.1.102');
    * 
    * // get the configuration
    * board.config(true).then(function(event) {
    *     var config = event.data;
    * 
    *     console.info('config:', event.name, event);
    * 
    *     // get all items with this key
    *     var items = config.getItems('extruder.hotend2.en_pin')[0];
    * 
    *     // get first item
    *     var item = items[0];
    * 
    *     console.log('extruder.hotend2.en_pin: ' + item.value());
    *     console.log('extruder.hotend2.en_pin:', item.value().toString());
    *     console.log('extruder.hotend2.en_pin:', item.value().toInteger());
    *     console.log('extruder.hotend2.en_pin:', item.value().toFloat());
    *     console.log('extruder.hotend2.en_pin:', item.value().toFloat(1));
    * 
    *     // set new value
    *     console.log('extruder.hotend2.en_pin: ' + item.value('4.28'));
    * 
    * })
    * .catch(function(event) {
    *     console.error('config:', event.name, event);
    * });
    * ```
    */
    sh.Board.prototype.config = function(txtFirst, timeout) {
        // self alias
        var self = this;

        // default timeout
        timeout = timeout === undefined ? 0 : timeout;

        // default filename
        var filenames = txtFirst
            ? ['config.txt', 'config']
            : ['config', 'config.txt'];

        // set current filename
        var filename = filenames[0];

        // no limit
        var limit = undefined;

        // get config file
        return self.cat('/sd/' + filename, limit, timeout).catch(function(event) {
            // set current filename
            filename = filenames[1];

            // try second name
            return self.cat('/sd/' + filename, limit, timeout).then(function(event) {
                // resolve the promise
                return Promise.resolve(event);
            });
        })
        .then(function(event) {
            // parse config file contents
            var config = new sh.BoardConfig(filename, event.data);

            // resolve the promise
            return Promise.resolve(self._trigger('config', event, config));
        });
    };

})();
