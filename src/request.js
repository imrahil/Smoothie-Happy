import { RequestEvent, ProgressEvent } from './events';

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
*/
class Request {
    constructor(settings) {
        // default settings
        settings = settings || {};

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
                this.data = Object.keys(this.data).map(key => {
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
        let xhrOptions = {};

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
    }

    /**
    * Execute the request and return a Promise.
    *
    * @method
    * @protected
    * @param {Object} xhrOptions An object of `XMLHttpRequest` settings.
    * @return {Promise}
    */
    _execute(xhrOptions) {
        // create and return the Promise
        return new Promise((resolve, reject) => {
            // open the request (async)
            this._xhr.open(this.method, this.url, true);

            // overwrite properties/methods
            for (let option in xhrOptions) {
                if (option === 'upload') {
                    for (let event in xhrOptions[option]) {
                        if (this._xhr.upload[event] !== undefined) {
                            this._xhr.upload[event] = xhrOptions[option][event];
                        }
                    }
                }
                else if (this._xhr[option] !== undefined) {
                    this._xhr[option] = xhrOptions[option];
                }
            }

            // force timeout
            this._xhr.timeout = this.timeout;

            // on load
            let LOAD_EVENT = 'load';

            this._xhr.onload = () => {
                if (this._xhr.status >= 200 && this._xhr.status < 300) {
                    resolve(new RequestEvent(LOAD_EVENT, this));
                }
                else {
                    reject(new RequestEvent(LOAD_EVENT, this));
                }
            };

            // on error
            this._xhr.onerror = () => {
                reject(new RequestEvent('error', this));
            };

            // on timeout
            this._xhr.ontimeout = () => {
                reject(new RequestEvent('timeout', this));
            };

            // on abort
            this._xhr.onabort = () => {
                reject(new RequestEvent('abort', this));
            };

            // on upload.load
            this._xhr.upload.onload = () => {
                LOAD_EVENT = 'upload.load';
            };

            // on upload.error
            this._xhr.upload.onerror = () => {
                reject(new RequestEvent('upload.error', this));
            };

            // on upload.timeout
            this._xhr.upload.ontimeout = () => {
                reject(new RequestEvent('upload.timeout', this));
            };

            // on upload.abort
            this._xhr.upload.onabort = () => {
                reject(new RequestEvent('upload.abort', this));
            };

            // set request headers
            for (let header in this.headers) {
                this._xhr.setRequestHeader(header, this.headers[header]);
            }

            // send the request
            this._xhr.send(this.method === 'POST' ? this.data : null);
        });
    }

    /**
    * Register progress event handler.
    *
    * @method
    * @param {Function} progressHandler An function receiving an {@link ProgressEvent} as first parameter.
    * @param {Object}   [context]       The callback context
    * @return {this}
    */
    onProgress(progressHandler, context) {
        // register progress event
        this._xhr.onprogress = event => {
            if (event.lengthComputable) {
                progressHandler.call(context || this, new ProgressEvent('progress', this, event));
            }
        };

        // return the promise
        return this;
    }

    /**
    * Register upload progress event handler.
    *
    * @method
    * @param {Function} progressHandler An function receiving an {@link ProgressEvent} as first parameter.
    * @param {Object}   [context]       The callback context
    * @return {this}
    */
    onUploadProgress(progressHandler, context) {
        // register upload progress event
        this._xhr.upload.onprogress = event => {
            if (event.lengthComputable) {
                progressHandler.call(context || this, new ProgressEvent('upload.progress', this, event));
            }
        };

        // return the promise
        return this;
    }

    /**
    * Appends fulfillment and rejection handlers to the promise.
    *
    * @method
    * @param {Function} onFulfilled Fulfillment callback.
    * @param {Function} onRejected  Rejection callback.
    * @return {Promise}
    */
    then(onFulfilled, onRejected) {
        return this._promise.then(onFulfilled, onRejected);
    }

    /**
    * Appends a rejection handler callback to the promise.
    *
    * @method
    * @param {Function} onRejected Rejection callback.
    * @return {Promise}
    */
    catch(onRejected) {
        return this._promise.catch(onRejected);
    }
}

/**
* Make and return an `Request`.
*
* @function
* @param {Object} settings Request settings. See {@link Request} for details.
* @return {Request}
*/
let request = function(settings) {
    return new Request(settings);
};

/**
* Make and return an GET `Request`.
*
* @function
* @param {Object} settings Request settings. See {@link Request} for details.
* @return {Request}
*/
let get = function(settings) {
    // defaults settings
    settings = settings || {};

    // force GET method
    settings.method = 'GET';

    // create and return the request
    return new Request(settings);
};

/**
* Make and return an POST `Request`.
*
* @function
* @param {Object} settings Request settings. See {@link Request} for details.
* @return {Request}
*/
let post = function(settings) {
    // defaults settings
    settings = settings || {};

    // force POST method
    settings.method = 'POST';

    // create and return the request
    return new Request(settings);
};

// Exports
export default Request;
export { Request, request, get, post };
