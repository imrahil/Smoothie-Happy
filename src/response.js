/**
* XMLHttpRequest response abstraction class.
*
* @class
* @param {XMLHttpRequest} xhr An `XMLHttpRequest` instance.
*/
class Response {
    constructor(xhr) {
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
    }
}

// Exports
export default Response;
export { Response };
