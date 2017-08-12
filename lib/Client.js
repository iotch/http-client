"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("es6-promise/auto");
var query_string_1 = require("@iotch/query-string");
var Options_1 = require("./Options");
var Headers_1 = require("./Headers");
var Response_1 = require("./Response");
var errorCodes_1 = require("./errorCodes");
/**
 * XMLHttpRequest2 wrapper with basic progress support
 */
var Client = (function () {
    /**
     * @param {OptionsInterface} options
     */
    function Client(options) {
        /**
         * Error codes
         * @type {object}
         */
        this.errorCodes = errorCodes_1.default;
        if (options) {
            this.globalOptions = options;
        }
    }
    /**
     * Sets the url intercepting function
     *
     * @param {UrlInterceptorType} interceptor
     */
    Client.prototype.interceptUrl = function (interceptor) {
        this.urlInterceptor = interceptor;
    };
    /**
     * Sets the options intercepting function
     *
     * @param {OptionsInterceptorType} interceptor
     */
    Client.prototype.interceptOptions = function (interceptor) {
        this.optionsInterceptor = interceptor;
    };
    /**
     * Sets the response intercepting function
     *
     * @param {ResponseInterceptorType} interceptor
     */
    Client.prototype.interceptResponse = function (interceptor) {
        this.responseInterceptor = interceptor;
    };
    /**
     * Creates request
     *
     * @param {string}           url
     * @param {OptionsInterface} localOptions
     */
    Client.prototype.request = function (url, localOptions) {
        var self = this;
        var urlInterceptor = self.urlInterceptor, optionsInterceptor = self.optionsInterceptor, responseInterceptor = self.responseInterceptor;
        if (urlInterceptor) {
            url = urlInterceptor(url);
        }
        if (optionsInterceptor) {
            localOptions = optionsInterceptor(localOptions || {});
        }
        var options = new Options_1.default(self.globalOptions);
        if (localOptions) {
            options.merge(localOptions);
        }
        var method = options.method, search = options.search, payload = options.payload, onSend = options.onSend, onLoad = options.onLoad, onProgress = options.onProgress, onError = options.onError;
        var promise = new Promise(function (resolve, reject) {
            try {
                var xhr_1 = new XMLHttpRequest();
                var headers = new Headers_1.default(options.headers || {});
                // build and append query string
                if (search) {
                    var encoded = query_string_1.default.encode(search, { arrayMode: 'brackets' });
                    if (encoded) {
                        url += '?' + encoded;
                    }
                }
                // build xhr request
                xhr_1.open(method, url.trim(), true, options.username, options.password);
                xhr_1.timeout = options.timeout;
                xhr_1.withCredentials = options.withCredentials;
                xhr_1.responseType = options.responseType;
                setXHRHeaders(xhr_1, headers);
                // load
                xhr_1.onload = function (event) {
                    try {
                        var response = new Response_1.default(event);
                        if (responseInterceptor) {
                            response = responseInterceptor(response);
                        }
                        if (response.isSuccessStatus) {
                            resolve(response);
                        }
                        else {
                            reject(response);
                        }
                        onLoad && onLoad(response);
                    }
                    catch (error) {
                        reject();
                        onError && onError({
                            code: errorCodes_1.default.LOAD_ERROR,
                            reason: error,
                        });
                    }
                };
                // errors
                xhr_1.onerror = xhr_1.ontimeout = xhr_1.onabort = function (event) {
                    reject(new Response_1.default(event));
                    var type = event.type;
                    var code = errorCodes_1.default.NETWORK_ERROR;
                    switch (type) {
                        case ('timeout'):
                            code = errorCodes_1.default.NETWORK_TIMEOUT;
                            break;
                        case ('abort'):
                            code = errorCodes_1.default.REQUEST_ABORTED;
                            break;
                    }
                    ;
                    onError && onError({
                        code: code,
                        reason: event,
                    });
                };
                // progress
                if (onProgress) {
                    var hanlder = function (e) {
                        self.onProgress(e, onProgress, xhr_1.abort.bind(xhr_1));
                    };
                    // if body allowed, subscribe to upload events
                    if (['POST', 'PUT'].indexOf(method) !== -1) {
                        xhr_1.upload.onloadstart = xhr_1.upload.onprogress = hanlder;
                    }
                    else {
                        xhr_1.onloadstart = xhr_1.onprogress = hanlder;
                    }
                    // use same loadend event for upload and download
                    // to know xhr.status which is not available in upload events
                    xhr_1.onloadend = hanlder;
                }
                // execute
                xhr_1.send(formatPayload(payload, headers));
                onSend && onSend();
            }
            catch (error) {
                reject();
                onError && onError({
                    code: errorCodes_1.default.CLIENT_ERROR,
                    reason: error,
                });
            }
        });
        return promise;
    };
    /**
     * Handles request progress
     *
     * @param {ProgressEvent}        e
     * @param {ProgressCallbackType} callback
     * @param {Function}             abortFn
     */
    Client.prototype.onProgress = function (e, callback, abortFn) {
        var xhr = e.target;
        var type = e.type;
        var progress = 0;
        if (type === 'progress') {
            if (e.lengthComputable) {
                progress = Math.floor((e.loaded / e.total) * 100);
                // set to 100 only at loadend
                // to not to duplicate 100 progress twice
                if (progress === 100) {
                    return;
                }
            }
            else {
                // unbind further progress events
                xhr.onprogress = function () { };
                // console.log('length is not computable');
                return;
            }
        }
        if (type === 'loadend') {
            // set 100 only on success responses
            var status_1 = xhr.status;
            if (status_1 > 199 && status_1 < 309) {
                progress = 100;
            }
        }
        callback(progress, abortFn);
    };
    return Client;
}());
exports.default = Client;
/**
 * Sets XHR headers
 *
 * @param {XMLHttpRequest}   xhr
 * @param {HeadersInterface} headers
 */
function setXHRHeaders(xhr, headers) {
    var h = headers.getAll();
    var _loop_1 = function (name_1) {
        var value = h[name_1];
        if (Array.isArray(value)) {
            value.forEach(function (v) {
                xhr.setRequestHeader(name_1, v);
            });
        }
        else {
            xhr.setRequestHeader(name_1, value);
        }
    };
    for (var name_1 in h) {
        _loop_1(name_1);
    }
    ;
    return xhr;
}
/**
 * Formats request payload according to Content-Type header
 *
 * @param {string}           text
 * @param {HeadersInterface} headers
 */
function formatPayload(payload, headers) {
    var header = 'content-type';
    try {
        // keep as-is
        if (payload === undefined
            || payload instanceof FormData
            || payload instanceof ArrayBuffer
            || payload instanceof Blob) {
            // contuinue
            // json
        }
        else if (headers.matches(header, '\/json[;\b]?')) {
            payload = JSON.stringify(payload);
            // urlencoded form
        }
        else if (headers.matches(header, 'application\/x-www-form-urlencoded')) {
            payload = query_string_1.default.encode(payload, { arrayMode: 'brackets' });
        }
        return payload;
    }
    catch (e) {
        throw new Error('Failed to format payload according to content type "' +
            headers.get(header) + '": ' + (e.message || e));
    }
}
