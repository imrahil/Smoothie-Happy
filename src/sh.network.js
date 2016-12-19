(function (sh) {
    'use strict';

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
    * @param {XMLHttpRequest} xhr An `XMLHttpRequest` instance.
    */
    sh.network.Response = function(xhr) {
        // text/xml response available ?
        var responseText = null;
        var responseXML  = null;

        if (xhr.responseType === '' || xhr.responseType === 'document') {
            responseText = xhr.responseText;
            responseXML  = xhr.responseXML;
        }

        /**
         * @property {Integer} - Response status code.
         * @readonly
         */
        this.code = xhr.status;

        /**
         * @property {String} - Respons status text.
         * @readonly
         */
        this.message = xhr.statusText;

        /**
         * @property {String} - Response type.
         * @readonly
         */
        this.type = xhr.responseType;

        /**
         * @property {String} - Response url.
         * @readonly
         */
        this.url = xhr.responseURL;

        /**
         * @property {String} - Response XML.
         * @readonly
         */
        this.xml = responseXML;

        /**
         * @property {String} - Response text.
         * @readonly
         */
        this.text = responseText;

        /**
         * @property {Mixed} - Raw response.
         * @readonly
         */
        this.raw = xhr.response;
    };

    /**
    * Custom request event.
    *
    * @class
    * @param {String}             name    Event name, possible values is `[upload.]load`, `[upload.]timeout`, `[upload.]abort` or `[upload.]error`.
    * @param {sh.network.Request} request Original `sh.network.Request` instance.
    */
    sh.network.RequestEvent = function(name, request) {
        /**
         * @property {String} - Possible values is `[upload.]load`, `[upload.]timeout`, `[upload.]abort` or `[upload.]error`.
         * @readonly
         */
        this.name = name;

        /**
         * @property {sh.network.Request} - Request instance.
         * @readonly
         */
        this.request = request;

        /**
         * @property {sh.network.Response} - Response instance.
         * @readonly
         */
        this.response = new sh.network.Response(request._xhr);

        /**
         * @property {Object|null} - Arbitrary data.
         * @readonly
         */
        this.data = null;
    };

    /**
    * Custom progress event.
    *
    * @class
    * @extends sh.network.RequestEvent
    * @param {String}             name    Event name, possible values is `progress` or `upload.progress`.
    * @param {sh.network.Request} request Original `sh.network.Request`.
    * @param {ProgressEvent}      event   Original `ProgressEvent`.
    */
    sh.network.ProgressEvent = function(name, request, event) {
        // call parent constructor
        sh.network.RequestEvent.call(this, name, request);

        /**
         * @property {String} - Possible values is `progress` or `upload.progress`.
         * @readonly
         */
        this.name = name;

        /**
         * @property {ProgressEvent} - `ProgressEvent` instance.
         * @readonly
         */
        this.originalEvent = event;

        /**
         * @property {Object|null} data         Progress data or null if not computable.
         * @property {Integer}     data.total   Total bytes.
         * @property {Integer}     data.loaded  Loaded bytes.
         * @property {Integer}     data.percent Loaded percent.
         * @readonly
         */
        this.data = ! event.lengthComputable ? null : {
            total  : event.total,
            loaded : event.loaded,
            percent: parseInt(event.loaded / event.total * 100)
        };
    };

    // extends sh.network.RequestEvent
    sh.network.ProgressEvent.prototype = Object.create(sh.network.RequestEvent.prototype);
    sh.network.ProgressEvent.prototype.constructor = sh.network.ProgressEvent;

    /**
    * `XMLHttpRequest` wrapper with `Promise` logic.
    *
    * @class
    * @param {Object}  settings                   Request settings.
    * @param {String}  settings.url               URL with protocol.
    * @param {String}  [settings.method  = 'GET'] 'GET', 'POST', 'DELETE', ...
    * @param {Mixed}   [settings.data    = null]  Data to send with the request.
    * @param {Object}  [settings.headers = null]  Headers to send with the request.
    * @param {Integer} [settings.timeout = 5000]  Timeout for this request in milliseconds.
    * @param {Object}  [settings.xhr     = null]  An `XMLHttpRequest` instance or an collection of `XMLHttpRequest` properties/methods to overwrite.
    * @see Please read {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise|this} and {@link https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html|that} to learn more about promises.
    * {$examples sh.network.Request}
    */
    sh.network.Request = function(settings) {
        // default settings
        var settings = settings || {};

        /**
        * @property {String} - Request url.
        * @default ''
        * @readonly
        */
        this.url = (settings.url || '').trim();

        /**
        * @property {String} - Request method.
        * @default 'GET'
        * @readonly
        */
        this.method = (settings.method  || 'GET').trim().toUpperCase();

        /**
        * @property {Mixed} - Request data.
        * @default null
        * @readonly
        */
        this.data = settings.data || null;

        // append data to url if not a POST method
        if (this.method !== 'POST' && this.data) {
            // stringify data object
            if (typeof this.data === 'object') {
                this.data = Object.keys(this.data).map(function(key) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(this.data[key]);
                }).join('&');
            }

            // trim data string
            this.data = this.data.trim();

            // remove the first char if it is an '?'
            if (this.data.indexOf('?') === 0) {
                this.data = this.data.substr(1);
            }

            // append '?' or '&' to the uri if not already set
            this.url += (this.url.indexOf('?') === -1) ? '?' : '&';

            // append data to uri
            this.url += this.data;

            // reset data
            this.data = null;
        }

        /**
        * @property {Object} - Request headers.
        * @default {}
        * @readonly
        */
        this.headers = settings.headers || {};

        /**
        * @property {Integer} - Request timeout in milliseconds.
        * @default 5000
        * @readonly
        */
        this.timeout = settings.timeout === undefined ? 5000 : settings.timeout;

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
    * @protected
    * @param {Object} xhrOptions An object of `XMLHttpRequest` settings.
    * @return {Promise}
    */
    sh.network.Request.prototype._execute = function(xhrOptions) {
        // self alias
        var self = this;

        // create and return the Promise
        return new Promise(function(resolve, reject) {
            // open the request (async)
            self._xhr.open(self.method, self.url, true);

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
            self._xhr.timeout = self.timeout;

            // on load
            var LOAD_EVENT = 'load';

            self._xhr.onload = function () {
                if (self._xhr.status >= 200 && self._xhr.status < 300) {
                    resolve(new sh.network.RequestEvent(LOAD_EVENT, self));
                }
                else {
                    reject(new sh.network.RequestEvent(LOAD_EVENT, self));
                }
            };

            // on error
            self._xhr.onerror = function () {
                reject(new sh.network.RequestEvent('error', self));
            };

            // on timeout
            self._xhr.ontimeout = function () {
                reject(new sh.network.RequestEvent('timeout', self));
            };

            // on abort
            self._xhr.onabort = function () {
                reject(new sh.network.RequestEvent('abort', self));
            };

            // on upload.load
            self._xhr.upload.onload = function () {
                LOAD_EVENT = 'upload.load';
            };

            // on upload.error
            self._xhr.upload.onerror = function () {
                reject(new sh.network.RequestEvent('upload.error', self));
            };

            // on upload.timeout
            self._xhr.upload.ontimeout = function () {
                reject(new sh.network.RequestEvent('upload.timeout', self));
            };

            // on upload.abort
            self._xhr.upload.onabort = function () {
                reject(new sh.network.RequestEvent('upload.abort', self));
            };

            // set request headers
            for (var header in self.headers) {
                self._xhr.setRequestHeader(header, self.headers[header]);
            }

            // send the request
            self._xhr.send(self.method === 'POST' ? self.data : null);
        });
    };

    /**
    * Register progress event handler.
    *
    * @method
    * @param {Function} progressHandler An function receiving an {@link sh.network.ProgressEvent} as first parameter.
    * @param {Object}   [context]       The callback context
    * @return {this}
    */
    sh.network.Request.prototype.onProgress = function(progressHandler, context) {
        // self alias
        var self = this;

        // register progress event
        this._xhr.onprogress = function(event) {
            if (event.lengthComputable) {
                progressHandler.call(context || this, new sh.network.ProgressEvent('progress', self, event));
            }
        };

        // return the promise
        return this;
    };

    /**
    * Register upload progress event handler.
    *
    * @method
    * @param {Function} progressHandler An function receiving an {@link sh.network.ProgressEvent} as first parameter.
    * @param {Object}   [context]       The callback context
    * @return {this}
    */
    sh.network.Request.prototype.onUploadProgress = function(progressHandler, context) {
        // self alias
        var self = this;

        // register upload progress event
        this._xhr.upload.onprogress = function(event) {
            if (event.lengthComputable) {
                progressHandler.call(context || this, new sh.network.ProgressEvent('upload.progress', self, event));
            }
        };

        // return the promise
        return this;
    };

    /**
    * Appends fulfillment and rejection handlers to the promise.
    *
    * @method
    * @param {Function} onFulfilled Fulfillment callback.
    * @param {Function} onRejected  Rejection callback.
    * @return {Promise}
    */
    sh.network.Request.prototype.then = function(onFulfilled, onRejected) {
        return this._promise.then(onFulfilled, onRejected);
    };

    /**
    * Appends a rejection handler callback to the promise.
    *
    * @method
    * @param {Function} onRejected Rejection callback.
    * @return {Promise}
    */
    sh.network.Request.prototype.catch = function(onRejected) {
        return this._promise.catch(onRejected);
    };

    /**
    * Make and return an `sh.network.Request`.
    *
    * @function
    * @param {Object} settings Request settings. See {@link sh.network.Request} for details.
    * @return {sh.network.request}
    */
    sh.network.request = function(settings) {
        return new sh.network.Request(settings);
    };

    /**
    * Make and return an GET `sh.network.Request`.
    *
    * @function
    * @param {Object} settings Request settings. See {@link sh.network.Request} for details.
    * @return {sh.network.Request}
    */
    sh.network.get = function(settings) {
        // defaults settings
        settings = settings || {};

        // force GET method
        settings.method = 'GET';

        // create and return the request
        return new sh.network.Request(settings);
    };

    /**
    * Make and return an POST `sh.network.Request`.
    *
    * @function
    * @param {Object} settings Request settings. See {@link sh.network.Request} for details.
    * @return {sh.network.Request}
    */
    sh.network.post = function(settings) {
        // defaults settings
        settings = settings || {};

        // force POST method
        settings.method = 'POST';

        // create and return the request
        return new sh.network.Request(settings);
    };

})({$name});
