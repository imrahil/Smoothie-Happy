/**
* Smoothie-Happy - A SmoothieBoard network communication API.
* @author   Sébastien Mischler (skarab) <sebastien@onlfait.ch>
* @see      {@link https://github.com/lautr3k/Smoothie-Happy}
* @build    4d4ef780cf17cc3541e30912e9f65116
* @date     Wed, 12 Oct 2016 15:39:59 +0000
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
    sh.build = '4d4ef780cf17cc3541e30912e9f65116';

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

        /** @property {Integer} - Response status code. */
        this.code = xhr.status;

        /** @property {String} - Respons status text. */
        this.message = xhr.statusText;

        /** @property {String} - Response type. */
        this.type = xhr.responseType;

        /** @property {String} - Response url. */
        this.url = xhr.responseURL;

        /** @property {String} - Response XML. */
        this.xml = xhr.responseXML;

        /** @property {String} - Response text. */
        this.text = xhr.responseText;

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

        // overwrite properties/methods
        for (var option in xhrOptions) {
            if (option === 'upload') {
                for (var event in xhrOptions[option]) {
                    if (this._xhr.upload[event] !== undefined) {
                        this._xhr.upload[event] = xhrOptions[option][event];
                    }
                }
            }
            else if (this._xhr[option] !== undefined) {
                this._xhr[option] = xhrOptions[option];
            }
        }

        /**
        * @property {Promise} - Promise instance.
        * @protected
        */
        this._promise = this._execute();
    };

    /**
    * Execute the request and return a Promise.
    *
    * @method
    * @protected
    *
    * @return {Promise}
    */
    sh.network.Request.prototype._execute = function() {
        // self alias
        var self = this;

        // create and return the Promise
        return new Promise(function(resolve, reject) {
            // open the request (async)
            self._xhr.open(self._method, self._url, true);

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
    * @param {String} name  Event name.
    * @param {String} event Original event.
    * @param {Mixed}  data  Event data.
    *
    * @return {sh.BoardEvent}
    */
    sh.Board.prototype._trigger = function(name, event, data) {
        // to board event
        event = sh.BoardEvent(name, this, event, data);

        // if defined, call user callback with the scope of this instance
        this._on[name] && this._on[name].call(this, event);

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

            var data = raw === 'ok' ? 'pong' : raw;

            // resolve the promise
            return Promise.resolve(sh.BoardEvent('ping', self, event, data));
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
            return Promise.resolve(sh.BoardEvent('version', self, event, self.info));
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
                return Promise.reject(sh.BoardEvent('ls', self, event, raw));
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
            return Promise.resolve(sh.BoardEvent('ls', self, event, files));
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
                return Promise.resolve(sh.BoardEvent('lsAll', self, event, tree));
            }

            return Promise.all(directory).then(function(events) {
                // for each Promise events
                for (var i = 0, il = events.length; i < il; i++) {
                    // add results to tree
                    tree = tree.concat(events[i].data);
                }

                // resolve the promise
                return Promise.resolve(sh.BoardEvent('lsAll', self, event, tree));
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
            return Promise.resolve(sh.BoardEvent('lsAll', self, event, tree));
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
                return Promise.reject(sh.BoardEvent('mv', self, event, raw));
            }

            // resolve the promise
            return Promise.resolve(sh.BoardEvent('mv', self, event, raw));
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
                return Promise.reject(sh.BoardEvent('rm', self, event, raw));
            }

            // response data
            var data = 'deleted ' + paths;

            // resolve the promise
            return Promise.resolve(sh.BoardEvent('rm', self, event, data));
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

        // command
        var command = 'cat ' + path;

        if (limit !== undefined) {
            command += ' ' + limit;
        }

        // send the command (promise)
        return self.command(command, timeout).then(function(event) {
            // raw response string
            var raw = event.originalEvent.response.raw;

            // file not found
            if (raw.indexOf('File not found:') == 0) {
                return Promise.reject(sh.BoardEvent('cat', self, event, raw));
            }

            // normalize line endding
            var text = raw.replace('\r\n', '\n');

            // resolve the promise
            return Promise.resolve(sh.BoardEvent('cat', self, event, text));
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
    *     // from item value
    *     console.log('extruder.hotend2.en_pin: ' + config.getItem('extruder.hotend2.en_pin').value());
    *     console.log('extruder.hotend2.en_pin:', config.getItem('extruder.hotend2.en_pin').value().toString());
    *     console.log('extruder.hotend2.en_pin:', config.getItem('extruder.hotend2.en_pin').value().toInteger());
    *     console.log('extruder.hotend2.en_pin:', config.getItem('extruder.hotend2.en_pin').value().toFloat());
    *     console.log('extruder.hotend2.en_pin:', config.getItem('extruder.hotend2.en_pin').value().toFloat(1));
    * 
    *     // set new value
    *     console.log('extruder.hotend2.en_pin: ' + config.getItem('extruder.hotend2.en_pin').value('4.28'));
    *     console.log('extruder.hotend2.en_pin: ' + config.setValue('extruder.hotend2.en_pin', '4.28'));
    * 
    *     // from item method
    *     console.log('extruder.hotend2.en_pin: ' + config.getValue('extruder.hotend2.en_pin'));
    *     console.log('extruder.hotend2.en_pin:', config.getValue('extruder.hotend2.en_pin').toString());
    *     console.log('extruder.hotend2.en_pin:', config.getValue('extruder.hotend2.en_pin').toInteger());
    *     console.log('extruder.hotend2.en_pin:', config.getValue('extruder.hotend2.en_pin').toFloat());
    *     console.log('extruder.hotend2.en_pin:', config.getValue('extruder.hotend2.en_pin').toFloat(1));
    * 
    *     // create item
    *     config.createItem({
    *         disabled: false,
    *         name    : 'custom.setting',
    *         value   : '5.5',
    *         comments: 'My setting usages...'
    *     });
    * 
    *     console.log('custom.setting: ' + config.getValue('custom.setting'));
    * 
    *     // replace item
    *     config.createItem({
    *         disabled: true,
    *         name    : 'custom.setting',
    *         value   : '8.2',
    *         comments: 'My new setting usages...'
    *     },
    *     {
    *         replace: true
    *     });
    * 
    *     console.log('custom.setting: ' + config.getValue('custom.setting'));
    * 
    *     // create and insert new item before another
    *     config.createItem({
    *         disabled: true,
    *         name    : 'custom.setting2',
    *         value   : '3.2',
    *         comments: 'My new setting usages...'
    *     },
    *     {
    *         position: 'before:custom.setting'
    *     });
    * 
    *     console.log('custom.setting: ' + config.getValue('custom.setting'));
    * })
    * .catch(function(event) {
    *     console.error('config:', event.name, event);
    * });
    * ```
    */
    sh.Board.prototype.config = function(txtFirst, timeout) {
        // self alias
        var self = this;

        // debug ---------------------------------------------------------------
        // var config = new sh.BoardConfig('config.test.txt', sampleConfig);
        // return Promise.resolve(sh.BoardEvent('config', self, null, config));
        // ---------------------------------------------------------------------

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
            return Promise.resolve(sh.BoardEvent('config', self, event, config));
        });
    };
/*
var sampleConfig = `
# NOTE Lines must not exceed 132 characters
## Robot module configurations : general handling of movement G-codes and slicing into moves
default_feed_rate                            4000             # Default rate ( mm/minute ) for G1/G2/G3 moves
default_seek_rate                            4000             # Default rate ( mm/minute ) for G0 moves
mm_per_arc_segment                           0.0              # Fixed length for line segments that divide arcs 0 to disable
mm_max_arc_error                             0.01             # The maximum error for line segments that divide arcs 0 to disable
                                                              # note it is invalid for both the above be 0
                                                              # if both are used, will use largest segment length based on radius
#mm_per_line_segment                          5                # Lines can be cut into segments ( not usefull with cartesian
                                                              # coordinates robots ).

# Arm solution configuration : Cartesian robot. Translates mm positions into stepper positions
alpha_steps_per_mm                           80               # Steps per mm for alpha stepper
beta_steps_per_mm                            80               # Steps per mm for beta stepper
gamma_steps_per_mm                           1600             # Steps per mm for gamma stepper

# Planner module configuration : Look-ahead and acceleration configuration
planner_queue_size                           32               # DO NOT CHANGE THIS UNLESS YOU KNOW EXACTLY WHAT YOU ARE DOING
acceleration                                 3000             # Acceleration in mm/second/second.
#z_acceleration                              500              # Acceleration for Z only moves in mm/s^2, 0 uses acceleration which is the default. DO NOT SET ON A DELTA
junction_deviation                           0.05             # Similar to the old "max_jerk", in millimeters,
                                                              # see https://github.com/grbl/grbl/blob/master/planner.c
                                                              # and https://github.com/grbl/grbl/wiki/Configuring-Grbl-v0.8
                                                              # Lower values mean being more careful, higher values means being
                                                              # faster and have more jerk
#z_junction_deviation                        0.0              # for Z only moves, -1 uses junction_deviation, zero disables junction_deviation on z moves DO NOT SET ON A DELTA
#minimum_planner_speed                       0.0              # sets the minimum planner speed in mm/sec

# Stepper module configuration
microseconds_per_step_pulse                  1                # Duration of step pulses to stepper drivers, in microseconds
base_stepping_frequency                      100000           # Base frequency for stepping

# Cartesian axis speed limits
x_axis_max_speed                             30000            # mm/min
y_axis_max_speed                             30000            # mm/min
z_axis_max_speed                             300              # mm/min

# Stepper module pins ( ports, and pin numbers, appending "!" to the number will invert a pin )
alpha_step_pin                               2.0              # Pin for alpha stepper step signal
alpha_dir_pin                                0.5              # Pin for alpha stepper direction
alpha_en_pin                                 0.4              # Pin for alpha enable pin
alpha_current                                1.5              # X stepper motor current
alpha_max_rate                               30000.0          # mm/min

beta_step_pin                                2.1              # Pin for beta stepper step signal
beta_dir_pin                                 0.11             # Pin for beta stepper direction
beta_en_pin                                  0.10             # Pin for beta enable
beta_current                                 1.5              # Y stepper motor current
beta_max_rate                                30000.0          # mm/min

gamma_step_pin                               2.2              # Pin for gamma stepper step signal
gamma_dir_pin                                0.20             # Pin for gamma stepper direction
gamma_en_pin                                 0.19             # Pin for gamma enable
gamma_current                                1.5              # Z stepper motor current
gamma_max_rate                               300.0            # mm/min

## System configuration
# Serial communications configuration ( baud rate defaults to 9600 if undefined )
uart0.baud_rate                              115200           # Baud rate for the default hardware serial port
second_usb_serial_enable                     false            # This enables a second usb serial port (to have both pronterface
                                                              # and a terminal connected)
#leds_disable                                true             # disable using leds after config loaded
#play_led_disable                            true             # disable the play led

# Kill button (used to be called pause) maybe assigned to a different pin, set to the onboard pin by default
kill_button_enable                           true             # set to true to enable a kill button
kill_button_pin                              2.12             # kill button pin. default is same as pause button 2.12 (2.11 is another good choice)

#msd_disable                                 false            # disable the MSD (USB SDCARD) when set to true (needs special binary)
#dfu_enable                                  false            # for linux developers, set to true to enable DFU
#watchdog_timeout                            10               # watchdog timeout in seconds, default is 10, set to 0 to disable the watchdog

# Only needed on a smoothieboard
currentcontrol_module_enable                 true             #

## Extruder module configuration
extruder.hotend.enable                          true             # Whether to activate the extruder module at all. All configuration is ignored if false
extruder.hotend.steps_per_mm                    140              # Steps per mm for extruder stepper
extruder.hotend.default_feed_rate               600              # Default rate ( mm/minute ) for moves where only the extruder moves
extruder.hotend.acceleration                    500              # Acceleration for the stepper motor mm/sec²
extruder.hotend.max_speed                       50               # mm/s

extruder.hotend.step_pin                        2.3              # Pin for extruder step signal
extruder.hotend.dir_pin                         0.22             # Pin for extruder dir signal
extruder.hotend.en_pin                          0.21             # Pin for extruder enable signal

# extruder offset
#extruder.hotend.x_offset                        0                # x offset from origin in mm
#extruder.hotend.y_offset                        0                # y offset from origin in mm
#extruder.hotend.z_offset                        0                # z offset from origin in mm

# firmware retract settings when using G10/G11, these are the defaults if not defined, must be defined for each extruder if not using the defaults
#extruder.hotend.retract_length                  3               # retract length in mm
#extruder.hotend.retract_feedrate                45              # retract feedrate in mm/sec
#extruder.hotend.retract_recover_length          0               # additional length for recover
#extruder.hotend.retract_recover_feedrate        8               # recover feedrate in mm/sec (should be less than retract feedrate)
#extruder.hotend.retract_zlift_length            0               # zlift on retract in mm, 0 disables
#extruder.hotend.retract_zlift_feedrate          6000            # zlift feedrate in mm/min (Note mm/min NOT mm/sec)

delta_current                                1.5              # First extruder stepper motor current

# Second extruder module configuration
#extruder.hotend2.enable                          true             # Whether to activate the extruder module at all. All configuration is ignored if false
#extruder.hotend2.steps_per_mm                    140              # Steps per mm for extruder stepper
#extruder.hotend2.default_feed_rate               600              # Default rate ( mm/minute ) for moves where only the extruder moves
#extruder.hotend2.acceleration                    500              # Acceleration for the stepper motor, as of 0.6, arbitrary ratio
#extruder.hotend2.max_speed                       50               # mm/s

#extruder.hotend2.step_pin                        2.8              # Pin for extruder step signal
#extruder.hotend2.dir_pin                         2.13             # Pin for extruder dir signal
#extruder.hotend2.en_pin                          4.29             # Pin for extruder enable signal

#extruder.hotend2.x_offset                        0                # x offset from origin in mm
#extruder.hotend2.y_offset                        25.0             # y offset from origin in mm
#extruder.hotend2.z_offset                        0                # z offset from origin in mm
#epsilon_current                              1.5              # Second extruder stepper motor current


## Laser module configuration
laser_module_enable                          false            # Whether to activate the laser module at all. All configuration is
                                                              # ignored if false.
#laser_module_pin                             2.5             # this pin will be PWMed to control the laser. Only P2.0 - P2.5, P1.18, P1.20, P1.21, P1.23, P1.24, P1.26, P3.25, P3.26
                                                              # can be used since laser requires hardware PWM
#laser_module_maximum_power                   1.0             # this is the maximum duty cycle that will be applied to the laser
#laser_module_minimum_power                   0.0             # This is a value just below the minimum duty cycle that keeps the laser
                                                              # active without actually burning.
#laser_module_default_power                   0.8             # This is the default laser power that will be used for cuts if a power has not been specified.  The value is a scale between
                                                              # the maximum and minimum power levels specified above
#laser_module_pwm_period                      20              # this sets the pwm frequency as the period in microseconds

## Temperature control configuration
# First hotend configuration
temperature_control.hotend.enable            true             # Whether to activate this ( "hotend" ) module at all.
                                                              # All configuration is ignored if false.
temperature_control.hotend.thermistor_pin    0.23             # Pin for the thermistor to read
temperature_control.hotend.heater_pin        2.7              # Pin that controls the heater, set to nc if a readonly thermistor is being defined
temperature_control.hotend.thermistor        EPCOS100K        # see http://smoothieware.org/temperaturecontrol#toc5
#temperature_control.hotend.beta             4066             # or set the beta value
temperature_control.hotend.set_m_code        104              #
temperature_control.hotend.set_and_wait_m_code 109            #
temperature_control.hotend.designator        T                #
#temperature_control.hotend.max_temp         300              # Set maximum temperature - Will prevent heating above 300 by default
#temperature_control.hotend.min_temp         0                # Set minimum temperature - Will prevent heating below if set

#temperature_control.hotend.p_factor         13.7             # permanently set the PID values after an auto pid
#temperature_control.hotend.i_factor         0.097            #
#temperature_control.hotend.d_factor         24               #

#temperature_control.hotend.max_pwm          64               # max pwm, 64 is a good value if driving a 12v resistor with 24v.

# Second hotend configuration
#temperature_control.hotend2.enable            true             # Whether to activate this ( "hotend" ) module at all.
                                                              # All configuration is ignored if false.

#temperature_control.hotend2.thermistor_pin    0.25             # Pin for the thermistor to read
#temperature_control.hotend2.heater_pin        1.23             # Pin that controls the heater
#temperature_control.hotend2.thermistor        EPCOS100K        # see http://smoothieware.org/temperaturecontrol#toc5
##temperature_control.hotend2.beta             4066             # or set the beta value
#temperature_control.hotend2.set_m_code        104              #
#temperature_control.hotend2.set_and_wait_m_code 109            #
#temperature_control.hotend2.designator        T1               #

#temperature_control.hotend2.p_factor          13.7           # permanently set the PID values after an auto pid
#temperature_control.hotend2.i_factor          0.097          #
#temperature_control.hotend2.d_factor          24             #

#temperature_control.hotend2.max_pwm          64               # max pwm, 64 is a good value if driving a 12v resistor with 24v.

temperature_control.bed.enable               true             #
temperature_control.bed.thermistor_pin       0.24             #
temperature_control.bed.heater_pin           2.5              #
temperature_control.bed.thermistor           Honeywell100K    # see http://smoothieware.org/temperaturecontrol#toc5
#temperature_control.bed.beta                3974             # or set the beta value

temperature_control.bed.set_m_code           140              #
temperature_control.bed.set_and_wait_m_code  190              #
temperature_control.bed.designator           B                #

#temperature_control.bed.bang_bang            false           # set to true to use bang bang control rather than PID
#temperature_control.bed.hysteresis           2.0             # set to the temperature in degrees C to use as hysteresis
                                                              # when using bang bang

## Switch module for fan control
switch.fan.enable                            true             #
switch.fan.input_on_command                  M106             #
switch.fan.input_off_command                 M107             #
switch.fan.output_pin                        2.6              #
switch.fan.output_type                       pwm              # pwm output settable with S parameter in the input_on_comand
#switch.fan.max_pwm                           255              # set max pwm for the pin default is 255

#switch.misc.enable                           true             #
#switch.misc.input_on_command                 M42              #
#switch.misc.input_off_command                M43              #
#switch.misc.output_pin                       2.4              #
#switch.misc.output_type                      digital          # just an on or off pin

# Switch module for spindle control
#switch.spindle.enable                        false            #

## Temperatureswitch :
# automatically toggle a switch at a specified temperature. Different ones of these may be defined to monitor different temperatures and switch different swithxes
# useful to turn on a fan or water pump to cool the hotend
#temperatureswitch.hotend.enable              true             #
#temperatureswitch.hotend.designator          T                # first character of the temperature control designator to use as the temperature sensor to monitor
#temperatureswitch.hotend.switch              misc             # select which switch to use, matches the name of the defined switch
#temperatureswitch.hotend.threshold_temp      60.0             # temperature to turn on (if rising) or off the switch
#temperatureswitch.hotend.heatup_poll         15               # poll heatup at 15 sec intervals
#temperatureswitch.hotend.cooldown_poll       60               # poll cooldown at 60 sec intervals


## Endstops
endstops_enable                              true             # the endstop module is enabled by default and can be disabled here
#corexy_homing                               false            # set to true if homing on a hbot or corexy
alpha_min_endstop                            1.24^            # add a ! to invert if endstop is NO connected to ground
alpha_max_endstop                            1.25^            # NOTE set to nc if this is not installed
alpha_homing_direction                       home_to_min      # or set to home_to_max and set alpha_max
alpha_min                                    0                # this gets loaded after homing when home_to_min is set
alpha_max                                    200              # this gets loaded after homing when home_to_max is set
beta_min_endstop                             1.26^            #
beta_max_endstop                             1.27^            #
beta_homing_direction                        home_to_min      #
beta_min                                     0                #
beta_max                                     200              #
gamma_min_endstop                            1.28^            #
gamma_max_endstop                            1.29^            #
gamma_homing_direction                       home_to_min      #
gamma_min                                    0                #
gamma_max                                    200              #

alpha_max_travel                             500              # max travel in mm for alpha/X axis when homing
beta_max_travel                              500              # max travel in mm for beta/Y axis when homing
gamma_max_travel                             500              # max travel in mm for gamma/Z axis when homing

# optional order in which axis will home, default is they all home at the same time,
# if this is set it will force each axis to home one at a time in the specified order
#homing_order                                 XYZ              # x axis followed by y then z last
#move_to_origin_after_home                    false            # move XY to 0,0 after homing

# optional enable limit switches, actions will stop if any enabled limit switch is triggered
#alpha_limit_enable                          false            # set to true to enable X min and max limit switches
#beta_limit_enable                           false            # set to true to enable Y min and max limit switches
#gamma_limit_enable                          false            # set to true to enable Z min and max limit switches

alpha_fast_homing_rate_mm_s                  50               # feedrates in mm/second
beta_fast_homing_rate_mm_s                   50               # "
gamma_fast_homing_rate_mm_s                  4                # "
alpha_slow_homing_rate_mm_s                  25               # "
beta_slow_homing_rate_mm_s                   25               # "
gamma_slow_homing_rate_mm_s                  2                # "

alpha_homing_retract_mm                      5                # distance in mm
beta_homing_retract_mm                       5                # "
gamma_homing_retract_mm                      1                # "

#endstop_debounce_count                       100              # uncomment if you get noise on your endstops, default is 100

## Z-probe
zprobe.enable                                false           # set to true to enable a zprobe
zprobe.probe_pin                             1.28!^          # pin probe is attached to if NC remove the !
zprobe.slow_feedrate                         5               # mm/sec probe feed rate
#zprobe.debounce_count                       100             # set if noisy
zprobe.fast_feedrate                         100             # move feedrate mm/sec
zprobe.probe_height                          5               # how much above bed to start probe
#gamma_min_endstop                           nc              # normally 1.28. Change to nc to prevent conflict,

# associated with zprobe the leveling strategy to use
#leveling-strategy.three-point-leveling.enable         true        # a leveling strategy that probes three points to define a plane and keeps the Z parallel to that plane
#leveling-strategy.three-point-leveling.point1         100.0,0.0   # the first probe point (x,y) optional may be defined with M557
#leveling-strategy.three-point-leveling.point2         200.0,200.0 # the second probe point (x,y)
#leveling-strategy.three-point-leveling.point3         0.0,200.0   # the third probe point (x,y)
#leveling-strategy.three-point-leveling.home_first     true        # home the XY axis before probing
#leveling-strategy.three-point-leveling.tolerance      0.03        # the probe tolerance in mm, anything less that this will be ignored, default is 0.03mm
#leveling-strategy.three-point-leveling.probe_offsets  0,0,0       # the probe offsets from nozzle, must be x,y,z, default is no offset
#leveling-strategy.three-point-leveling.save_plane     false       # set to true to allow the bed plane to be saved with M500 default is false

## Panel
panel.enable                                 false             # set to true to enable the panel code

# Example for reprap discount GLCD
# on glcd EXP1 is to left and EXP2 is to right, pin 1 is bottom left, pin 2 is top left etc.
# +5v is EXP1 pin 10, Gnd is EXP1 pin 9
#panel.lcd                                   reprap_discount_glcd     #
#panel.spi_channel                           0                 # spi channel to use  ; GLCD EXP1 Pins 3,5 (MOSI, SCLK)
#panel.spi_cs_pin                            0.16              # spi chip select     ; GLCD EXP1 Pin 4
#panel.encoder_a_pin                         3.25!^            # encoder pin         ; GLCD EXP2 Pin 3
#panel.encoder_b_pin                         3.26!^            # encoder pin         ; GLCD EXP2 Pin 5
#panel.click_button_pin                      1.30!^            # click button        ; GLCD EXP1 Pin 2
#panel.buzz_pin                              1.31              # pin for buzzer      ; GLCD EXP1 Pin 1
#panel.back_button_pin                       2.11!^            # back button         ; GLCD EXP2 Pin 8

# pins used with other panels
#panel.up_button_pin                         0.1!              # up button if used
#panel.down_button_pin                       0.0!              # down button if used
#panel.click_button_pin                      0.18!             # click button if used

panel.menu_offset                            0                 # some panels will need 1 here

panel.alpha_jog_feedrate                     6000              # x jogging feedrate in mm/min
panel.beta_jog_feedrate                      6000              # y jogging feedrate in mm/min
panel.gamma_jog_feedrate                     200               # z jogging feedrate in mm/min

panel.hotend_temperature                     185               # temp to set hotend when preheat is selected
panel.bed_temperature                        60                # temp to set bed when preheat is selected

## Custom menus : Example of a custom menu entry, which will show up in the Custom entry.
# NOTE _ gets converted to space in the menu and commands, | is used to separate multiple commands
custom_menu.power_on.enable                true              #
custom_menu.power_on.name                  Power_on          #
custom_menu.power_on.command               M80               #

custom_menu.power_off.enable               true              #
custom_menu.power_off.name                 Power_off         #
custom_menu.power_off.command              M81               #


## Network settings
network.enable                               true            # enable the ethernet network services
network.webserver.enable                     true             # enable the webserver
network.telnet.enable                        true             # enable the telnet server
network.ip_address                           auto             # use dhcp to get ip address
# uncomment the 3 below to manually setup ip address
#network.ip_address                           192.168.3.222    # the IP address
#network.ip_mask                              255.255.255.0    # the ip mask
#network.ip_gateway                           192.168.3.1      # the gateway address
#network.mac_override                         xx.xx.xx.xx.xx.xx  # override the mac address, only do this if you have a conflict
`;
*/

})();
