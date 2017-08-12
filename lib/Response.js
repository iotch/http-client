"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Headers_1 = require("./Headers");
var Response = (function () {
    /**
     * @param {Event} e
     */
    function Response(e) {
        /**
         * {@inheritdoc}
         */
        this.status = 0;
        /**
         * {@inheritdoc}
         */
        this.isSuccessStatus = false;
        /**
         * {@inheritdoc}
         */
        this.statusText = '';
        /**
         * {@inheritdoc}
         */
        this.type = '';
        /**
         * {@inheritdoc}
         */
        this.body = null;
        /**
         * {@inheritdoc}
         */
        this.error = false;
        /**
         * {@inheritdoc}
         */
        this.errorText = '';
        var self = this;
        var eventType = e.type;
        var xhr = e.target;
        var status = xhr.status;
        switch (eventType) {
            case ('error'):
            case ('abort'):
            case ('timeout'):
                self.error = true;
                self.errorText = eventType;
                break;
        }
        this.headers = new Headers_1.default(xhr.getAllResponseHeaders());
        self.status = status;
        self.isSuccessStatus = 199 < status && status < 305;
        self.statusText = xhr.statusText;
        self.type = xhr.responseType;
        self.body = xhr.response;
        // json response type is not supported by IE, try to decode
        if (self.type === '' && typeof self.body === 'string') {
            self.body = formatResponse(self.body, self.headers);
        }
    }
    return Response;
}());
exports.default = Response;
/**
 * Formats text response according to Content-Type header
 *
 * @param {string}  text
 * @param {Headers} headers
 */
function formatResponse(text, headers) {
    try {
        var name_1 = 'content-type';
        if (headers.matches(name_1, '\/json[;\b]*?')) {
            var parsed = JSON.parse(text);
            return parsed;
        }
        return text;
    }
    catch (e) {
        throw new Error('Failed to format response text according to content type "' +
            headers.get(name) + '": ' + (e.message || e));
    }
}
