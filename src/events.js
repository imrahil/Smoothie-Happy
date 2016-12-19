import Response from './response';

/**
* Request event.
*
* @class
* @param {String}             name    Event name, possible values is `[upload.]load`, `[upload.]timeout`, `[upload.]abort` or `[upload.]error`.
* @param {Request} request Original `Request` instance.
*/
class RequestEvent {
    constructor(name, request) {
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
        this.response = new Response(request._xhr);

        /**
         * @property {Object|null} - Arbitrary data.
         * @readonly
         */
        this.data = null;
    }
}

/**
* Custom progress event.
*
* @class
* @extends RequestEvent
* @param {String}             name    Event name, possible values is `progress` or `upload.progress`.
* @param {Request} request Original `Request`.
* @param {ProgressEvent}      event   Original `ProgressEvent`.
*/
class ProgressEvent extends RequestEvent {
    constructor(name, request, event) {
        // call parent constructor
        super(name, request);

        /**
         * @property {String} - Possible values is `progress` or `upload.progress`.
         * @readonly
         */

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
    }
}

// Exports
export { RequestEvent, ProgressEvent };
