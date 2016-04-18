/**
 * Smoothie-Happy global namespace.
 * @namespace
 */
var sh = sh || {};

 (function () {
    'use strict';

    /** @property {String} */
    sh.version = '0.0.1-alpha';

    /** @property {String} */
    sh.name = 'Smoothie Happy';

    /** @property {String} */
    sh.description = 'Smoothieware network communication API.';

    /** @property {String} */
    sh.link = 'https://github.com/lautr3k/Smoothie-Happy';

    /**
     * Network module.
     * @namespace
     */
    sh.network = {
        /**
         * @property {Integer} timeout Default timeout for all request (ms).
         * @default  5000
         */
        timeout: 5000
    };

    /**
     * XMLHttpRequest wrapper.
     * @method sh.network.request
     * @param {String}  type             'GET' or 'POST'.
     * @param {String}  url              URL with protocol.
     * @param {Object}  settings         Request settings.
     * @param {Mixed}   settings.data    Data to send with the request.
     * @param {Object}  settings.headers Headers to send with the request.
     * @param {Object}  settings.options {XMLHttpRequest} properties/methods to overwrite.
     * @return {XMLHttpRequest}
     */
    sh.network.request = function(type, url, settings) {
        // force type to uppercase
        type = type.toUpperCase();

        // defaults settings
        settings = settings || {};

        var data     = settings.data    || null;
        var headers  = settings.headers || {};
        var options  = settings.options || settings;

        // http request object
        var xhr = new XMLHttpRequest();

        // open the request
        xhr.open(type, url, true);

        // set default xhr properties
        options.timeout = options.timeout || this.timeout;

        // set user xhr properties
        for (var key in options) {
            if (key === 'upload') {
                for (var event in options[key]) {
                    if (xhr.upload[event] !== undefined) {
                        xhr.upload[event] = options[key][event];
                    }
                }
            }
            else if (xhr[key] !== undefined) {
                xhr[key] = options[key];
            }
        }

        // append data to url on GET request
        if (type === 'GET' && data) {
            url += data;
            data = null;
        }

        // set custom headers
        for (var key in headers) {
            xhr.setRequestHeader(key, headers[key]);
        }

        // send the request
        xhr.send(type === 'POST' ? data : null);

        // return the request object
        return xhr;
    };

    /**
     * GET request.
     * @method sh.network.get
     * @param  {String}  url       URL with protocol.
     * @param  {Object}  settings  See "{@link sh.network.request}.settings" for possible settings values.
     * @return {XMLHttpRequest}
     */
    sh.network.get = function(url, settings) {
        return this.request('GET', url, settings);
    };

    /**
     * POST request.
     * @method sh.network.post
     * @param  {String}  url       URL with protocol.
     * @param  {Object}  settings  See "{@link sh.network.request}.settings" for possible settings values.
     * @return {XMLHttpRequest}
     */
    sh.network.post = function(url, settings) {
        return this.request('POST', url, settings);
    };

    /**
     * Upload a file on the sd card.
     * @method sh.network.upload
     * @param  {String}       ip        Board ip.
     * @param  {Object|File}  file      {File} object or an {Object} with "name" and "data" properties set.
     * @param  {Object}       settings  See "{@link sh.network.request}.settings" for possible settings values.
     * @return {XMLHttpRequest}
     */
    sh.network.upload = function(ip, file, settings) {
        // defaults settings
        settings = settings || {};

        // file is a string, convert to Blob
        if (typeof file === 'string') {
            file = new Blob([file], { 'type': 'text/plain' });
        }

        // file is a File or Blob object, wrap it...
        if (file instanceof File || file instanceof Blob) {
            file = {
                name: file.name,
                data: file
            }
        }

        // set file data
        settings.data = file.data;

        // set file name header
        settings.headers = { 'X-Filename': file.name };

        // send the command as post request
        return this.post('http://' + ip + '/upload', settings);
    };

})();
