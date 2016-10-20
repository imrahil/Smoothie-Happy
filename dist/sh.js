/**
* Smoothie-Happy - A SmoothieBoard network communication API.
* @author   Sébastien Mischler (skarab) <sebastien@onlfait.ch>
* @see      {@link https://github.com/lautr3k/Smoothie-Happy}
* @build    e9516897078299e99536ad82dd09cb2f
* @date     Thu, 20 Oct 2016 16:41:17 +0000
* @version  0.3.0-dev
* @license  MIT
* @namespace
*/
var sh = {};

(function (sh) {
    'use strict';

    /**
    * @property {String} - API version.
    * @default
    * @readonly
    */
    sh.version = '0.3.0-dev';

})(sh);

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
    * @param {String}             name    Event name, possible values is `[upload.]load`, `[upload.]timeout`, `[upload.]abort` or `[upload.]error`.
    * @param {sh.network.Request} request Original `sh.network.Request` instance.
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
    * @param {Object}  settings                   Request settings.
    * @param {String}  settings.url               URL with protocol.
    * @param {String}  [settings.method  = 'GET'] 'GET', 'POST', 'DELETE', ...
    * @param {Mixed}   [settings.data    = null]  Data to send with the request.
    * @param {Object}  [settings.headers = null]  Headers to send with the request.
    * @param {Integer} [settings.timeout = 5000]  Timeout for this request in milliseconds.
    * @param {Object}  [settings.xhr     = null]  An `XMLHttpRequest` instance or an collection of `XMLHttpRequest` properties/methods to overwrite.
    * @see Please read {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise|this} and {@link https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html|that} to learn more about promises.
    * @example
    * ### Single request
    * ```
    * new sh.network.Request({
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
    * @example
    * ### Chaining requests
    * ```
    * new sh.network.Request({
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
    *     return new sh.network.Request({
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
    * @example
    * ### Multiple requests (all)
    * ```
    * var requests = [
    *     new sh.network.Request({ url: 'index.html?request=1'}),
    *     new sh.network.Request({ url: 'index.html?request=2'}),
    *     new sh.network.Request({ url: 'index.html?request=3'})
    * ];
    * 
    * // The Promise.all(iterable) method returns a promise that resolves
    * // when all of the promises in the iterable argument have resolved,
    * // or rejects with the event of the first passed promise that rejects
    * Promise.all(requests).then(function(events) {
    *     // All requests are resloved
    *     for (var i = 0; i < events.length; i++) {
    *         console.info(events[i].request._url, '>> loaded >>', events[i].response);
    *     }
    * })
    * .catch(function(event) {
    *     // First passed promise that rejects
    *     console.warn(event.request._url, '>> error >>', event.response);
    * });
    * ```
    * @example
    * ### Multiple requests (race)
    * ```
    * var requests = [
    *     new sh.network.Request({ url: 'index.html?request=1'}),
    *     new sh.network.Request({ url: 'index.html?request=2'}),
    *     new sh.network.Request({ url: 'index.html?request=3'})
    * ];
    * 
    * // The Promise.race(iterable) method returns a promise that resolves or rejects
    * // as soon as one of the promises in the iterable resolves or rejects,
    * // with the event from that promise.
    * Promise.race(requests).then(function(event) {
    *     // First passed promise that resolves
    *     console.info(event.request._url, '>> loaded >>', event.response);
    * })
    * .catch(function(event) {
    *     // First passed promise that rejects
    *     console.warn(event.request._url, '>> error >>', event.response);
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
            var LOAD_EVENT = 'load';

            self._xhr.onload = function () {
                if (self._xhr.status >= 200 && self._xhr.status < 300) {
                    resolve(sh.network.RequestEvent(LOAD_EVENT, self));
                }
                else {
                    reject(sh.network.RequestEvent(LOAD_EVENT, self));
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
            self._xhr.upload.onload = function () {
                LOAD_EVENT = 'upload.load';
            };

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
        return sh.network.Request(settings);
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
        return sh.network.Request(settings);
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
        return sh.network.Request(settings);
    };

})(sh);

