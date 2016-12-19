(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("SmoothieHappy", [], factory);
	else if(typeof exports === 'object')
		exports["SmoothieHappy"] = factory();
	else
		root["SmoothieHappy"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _request = __webpack_require__(2);
	
	Object.defineProperty(exports, 'Request', {
	  enumerable: true,
	  get: function get() {
	    return _request.Request;
	  }
	});
	Object.defineProperty(exports, 'request', {
	  enumerable: true,
	  get: function get() {
	    return _request.request;
	  }
	});
	Object.defineProperty(exports, 'get', {
	  enumerable: true,
	  get: function get() {
	    return _request.get;
	  }
	});
	Object.defineProperty(exports, 'post', {
	  enumerable: true,
	  get: function get() {
	    return _request.post;
	  }
	});

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.post = exports.get = exports.request = exports.Request = undefined;
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _events = __webpack_require__(3);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
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
	var Request = function () {
	    function Request(settings) {
	        var _this = this;
	
	        _classCallCheck(this, Request);
	
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
	        this.method = (settings.method || 'GET').trim().toUpperCase();
	
	        /**
	        * @property {Mixed} - Request data.
	        * @default null
	        * @readonly
	        */
	        this.data = settings.data || null;
	
	        // append data to url if not a POST method
	        if (this.method !== 'POST' && this.data) {
	            // stringify data object
	            if (_typeof(this.data) === 'object') {
	                this.data = Object.keys(this.data).map(function (key) {
	                    return encodeURIComponent(key) + '=' + encodeURIComponent(_this.data[key]);
	                }).join('&');
	            }
	
	            // trim data string
	            this.data = this.data.trim();
	
	            // remove the first char if it is an '?'
	            if (this.data.indexOf('?') === 0) {
	                this.data = this.data.substr(1);
	            }
	
	            // append '?' or '&' to the uri if not already set
	            this.url += this.url.indexOf('?') === -1 ? '?' : '&';
	
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
	
	        if (!(this._xhr instanceof XMLHttpRequest)) {
	            // maybe properties/methods to overwrite
	            if (this._xhr && _typeof(this._xhr) === 'object') {
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
	
	
	    _createClass(Request, [{
	        key: '_execute',
	        value: function _execute(xhrOptions) {
	            var _this2 = this;
	
	            // create and return the Promise
	            return new Promise(function (resolve, reject) {
	                // open the request (async)
	                _this2._xhr.open(_this2.method, _this2.url, true);
	
	                // overwrite properties/methods
	                for (var option in xhrOptions) {
	                    if (option === 'upload') {
	                        for (var event in xhrOptions[option]) {
	                            if (_this2._xhr.upload[event] !== undefined) {
	                                _this2._xhr.upload[event] = xhrOptions[option][event];
	                            }
	                        }
	                    } else if (_this2._xhr[option] !== undefined) {
	                        _this2._xhr[option] = xhrOptions[option];
	                    }
	                }
	
	                // force timeout
	                _this2._xhr.timeout = _this2.timeout;
	
	                // on load
	                var LOAD_EVENT = 'load';
	
	                _this2._xhr.onload = function () {
	                    if (_this2._xhr.status >= 200 && _this2._xhr.status < 300) {
	                        resolve(new _events.RequestEvent(LOAD_EVENT, _this2));
	                    } else {
	                        reject(new _events.RequestEvent(LOAD_EVENT, _this2));
	                    }
	                };
	
	                // on error
	                _this2._xhr.onerror = function () {
	                    reject(new _events.RequestEvent('error', _this2));
	                };
	
	                // on timeout
	                _this2._xhr.ontimeout = function () {
	                    reject(new _events.RequestEvent('timeout', _this2));
	                };
	
	                // on abort
	                _this2._xhr.onabort = function () {
	                    reject(new _events.RequestEvent('abort', _this2));
	                };
	
	                // on upload.load
	                _this2._xhr.upload.onload = function () {
	                    LOAD_EVENT = 'upload.load';
	                };
	
	                // on upload.error
	                _this2._xhr.upload.onerror = function () {
	                    reject(new _events.RequestEvent('upload.error', _this2));
	                };
	
	                // on upload.timeout
	                _this2._xhr.upload.ontimeout = function () {
	                    reject(new _events.RequestEvent('upload.timeout', _this2));
	                };
	
	                // on upload.abort
	                _this2._xhr.upload.onabort = function () {
	                    reject(new _events.RequestEvent('upload.abort', _this2));
	                };
	
	                // set request headers
	                for (var header in _this2.headers) {
	                    _this2._xhr.setRequestHeader(header, _this2.headers[header]);
	                }
	
	                // send the request
	                _this2._xhr.send(_this2.method === 'POST' ? _this2.data : null);
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
	
	    }, {
	        key: 'onProgress',
	        value: function onProgress(progressHandler, context) {
	            var _this3 = this;
	
	            // register progress event
	            this._xhr.onprogress = function (event) {
	                if (event.lengthComputable) {
	                    progressHandler.call(context || _this3, new _events.ProgressEvent('progress', _this3, event));
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
	
	    }, {
	        key: 'onUploadProgress',
	        value: function onUploadProgress(progressHandler, context) {
	            var _this4 = this;
	
	            // register upload progress event
	            this._xhr.upload.onprogress = function (event) {
	                if (event.lengthComputable) {
	                    progressHandler.call(context || _this4, new _events.ProgressEvent('upload.progress', _this4, event));
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
	
	    }, {
	        key: 'then',
	        value: function then(onFulfilled, onRejected) {
	            return this._promise.then(onFulfilled, onRejected);
	        }
	
	        /**
	        * Appends a rejection handler callback to the promise.
	        *
	        * @method
	        * @param {Function} onRejected Rejection callback.
	        * @return {Promise}
	        */
	
	    }, {
	        key: 'catch',
	        value: function _catch(onRejected) {
	            return this._promise.catch(onRejected);
	        }
	    }]);
	
	    return Request;
	}();
	
	/**
	* Make and return an `Request`.
	*
	* @function
	* @param {Object} settings Request settings. See {@link Request} for details.
	* @return {Request}
	*/
	
	
	var request = function request(settings) {
	    return new Request(settings);
	};
	
	/**
	* Make and return an GET `Request`.
	*
	* @function
	* @param {Object} settings Request settings. See {@link Request} for details.
	* @return {Request}
	*/
	var get = function get(settings) {
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
	var post = function post(settings) {
	    // defaults settings
	    settings = settings || {};
	
	    // force POST method
	    settings.method = 'POST';
	
	    // create and return the request
	    return new Request(settings);
	};
	
	// Exports
	exports.default = Request;
	exports.Request = Request;
	exports.request = request;
	exports.get = get;
	exports.post = post;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.ProgressEvent = exports.RequestEvent = undefined;
	
	var _response = __webpack_require__(4);
	
	var _response2 = _interopRequireDefault(_response);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	* Request event.
	*
	* @class
	* @param {String}             name    Event name, possible values is `[upload.]load`, `[upload.]timeout`, `[upload.]abort` or `[upload.]error`.
	* @param {Request} request Original `Request` instance.
	*/
	var RequestEvent = function RequestEvent(name, request) {
	  _classCallCheck(this, RequestEvent);
	
	  /**
	   * @property {String} - Possible values is `[upload.]load`, `[upload.]timeout`, `[upload.]abort` or `[upload.]error`.
	   * @readonly
	   */
	  this.name = name;
	
	  /**
	   * @property {Request} - Request instance.
	   * @readonly
	   */
	  this.request = request;
	
	  /**
	   * @property {Response} - Response instance.
	   * @readonly
	   */
	  this.response = new _response2.default(request._xhr);
	
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
	* @extends RequestEvent
	* @param {String}             name    Event name, possible values is `progress` or `upload.progress`.
	* @param {Request} request Original `Request`.
	* @param {ProgressEvent}      event   Original `ProgressEvent`.
	*/
	
	
	var ProgressEvent = function (_RequestEvent) {
	  _inherits(ProgressEvent, _RequestEvent);
	
	  function ProgressEvent(name, request, event) {
	    _classCallCheck(this, ProgressEvent);
	
	    /**
	     * @property {String} - Possible values is `progress` or `upload.progress`.
	     * @readonly
	     */
	
	    /**
	     * @property {ProgressEvent} - `ProgressEvent` instance.
	     * @readonly
	     */
	    var _this = _possibleConstructorReturn(this, (ProgressEvent.__proto__ || Object.getPrototypeOf(ProgressEvent)).call(this, name, request));
	    // call parent constructor
	
	
	    _this.originalEvent = event;
	
	    /**
	     * @property {Object|null} data         Progress data or null if not computable.
	     * @property {Integer}     data.total   Total bytes.
	     * @property {Integer}     data.loaded  Loaded bytes.
	     * @property {Integer}     data.percent Loaded percent.
	     * @readonly
	     */
	    _this.data = !event.lengthComputable ? null : {
	      total: event.total,
	      loaded: event.loaded,
	      percent: parseInt(event.loaded / event.total * 100)
	    };
	    return _this;
	  }
	
	  return ProgressEvent;
	}(RequestEvent);
	
	// Exports
	
	
	exports.RequestEvent = RequestEvent;
	exports.ProgressEvent = ProgressEvent;

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	* XMLHttpRequest response abstraction class.
	*
	* @class
	* @param {XMLHttpRequest} xhr An `XMLHttpRequest` instance.
	*/
	var Response = function Response(xhr) {
	  _classCallCheck(this, Response);
	
	  // text/xml response available ?
	  var responseText = null;
	  var responseXML = null;
	
	  if (xhr.responseType === '' || xhr.responseType === 'document') {
	    responseText = xhr.responseText;
	    responseXML = xhr.responseXML;
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
	
	// Exports
	
	
	exports.default = Response;
	exports.Response = Response;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=smoothie-happy.js.map