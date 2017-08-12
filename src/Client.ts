import 'es6-promise/auto';
import QueryString from '@iotch/query-string';
import Options, { OptionsInterface, ProgressCallbackType } from './Options';
import Headers from './Headers';
import Response, { ResponseInterface } from './Response';
import errorCodes from './errorCodes';

/**
 * XMLHttpRequest2 wrapper with basic progress support
 */
export default class Client {

    /**
     * Error codes
     * @type {object}
     */
    public readonly errorCodes = errorCodes;

    /**
     * Global options
     * @type {OptionsInterface}
     */
    protected globalOptions: OptionsInterface;

    /**
     * Url interceptor
     * @type {UrlInterceptorType}
     */
    protected urlInterceptor: UrlInterceptorType;

    /**
     * Options interceptor
     * @type {OptionsInterceptorType}
     */
    protected optionsInterceptor: OptionsInterceptorType;

    /**
     * Response interceptor
     * @type {ResponseInterceptorType}
     */
    protected responseInterceptor: ResponseInterceptorType;

    /**
     * @param {OptionsInterface} options
     */
    public constructor(options?: OptionsInterface) {
        if(options) {
            this.globalOptions = options;
        }
    }

    /**
     * Sets the url intercepting function
     *
     * @param {UrlInterceptorType} interceptor
     */
    public interceptUrl(interceptor: UrlInterceptorType) {
        this.urlInterceptor = interceptor;
    }

    /**
     * Sets the options intercepting function
     *
     * @param {OptionsInterceptorType} interceptor
     */
    public interceptOptions(interceptor: OptionsInterceptorType) {
        this.optionsInterceptor = interceptor;
    }

    /**
     * Sets the response intercepting function
     *
     * @param {ResponseInterceptorType} interceptor
     */
    public interceptResponse(interceptor: ResponseInterceptorType) {
        this.responseInterceptor = interceptor;
    }

    /**
     * Creates request
     *
     * @param {string}           url
     * @param {OptionsInterface} localOptions
     */
    public request(url: string, localOptions?: OptionsInterface): Promise<ResponseInterface> {
        const self = this;
        const { urlInterceptor, optionsInterceptor, responseInterceptor } = self;

        if (urlInterceptor) {
            url = urlInterceptor(url);
        }

        if (optionsInterceptor) {
            localOptions = optionsInterceptor(localOptions || {});
        }

        let options = new Options(self.globalOptions);
        if (localOptions) {
            options.merge(localOptions);
        }
        const { method, search, payload, onSend, onLoad, onProgress, onError } = options;

        const promise = new Promise<ResponseInterface>(function(resolve, reject) {
            try {
                const xhr = new XMLHttpRequest();
                const headers = new Headers(options.headers || {});

                // build and append query string
                if (search) {
                    const encoded = QueryString.encode(search, {arrayMode: 'brackets'});
                    if(encoded) {
                        url += '?' + encoded;
                    }
                }

                // build xhr request
                xhr.open(
                    method,
                    url.trim(),
                    true,
                    options.username,
                    options.password
                );
                xhr.timeout = options.timeout;
                xhr.withCredentials = options.withCredentials;
                xhr.responseType = options.responseType;
                setXHRHeaders(xhr, headers);

                // load
                xhr.onload = function(event: ProgressEvent) {
                    try {
                        let response = new Response(event);
                        if (responseInterceptor) {
                            response = responseInterceptor(response);
                        }
                        if (response.isSuccessStatus) {
                            resolve(response);
                        } else {
                            reject(response);
                        }
                        onLoad && onLoad(response);
                    } catch (error) {
                        reject();
                        onError && onError({
                            code: errorCodes.LOAD_ERROR,
                            reason: error,
                        });
                    }
                }

                // errors
                xhr.onerror = xhr.ontimeout = xhr.onabort = function(event: Event) {

                    reject(new Response(event));

                    const type = event.type;
                    let code = errorCodes.NETWORK_ERROR;
                    switch(type) {
                        case ('timeout'):
                            code = errorCodes.NETWORK_TIMEOUT;
                            break;
                        case ('abort'):
                            code = errorCodes.REQUEST_ABORTED;
                            break;
                    };

                    onError && onError({
                        code: code,
                        reason: event,
                    });
                };

                // progress
                if (onProgress) {
                    const hanlder = function(e: ProgressEvent) {
                        self.onProgress(e, onProgress, xhr.abort.bind(xhr));
                    };

                    // if body allowed, subscribe to upload events
                    if (['POST', 'PUT'].indexOf(method) !== -1) {
                        xhr.upload.onloadstart = xhr.upload.onprogress = hanlder;
                    } else {
                        xhr.onloadstart = xhr.onprogress = hanlder;
                    }
                    // use same loadend event for upload and download
                    // to know xhr.status which is not available in upload events
                    xhr.onloadend = hanlder;
                }

                // execute
                xhr.send(formatPayload(payload, headers));

                onSend && onSend();

            } catch(error) {
                reject();
                onError && onError({
                    code: errorCodes.CLIENT_ERROR,
                    reason: error,
                });
            }
        });

        return promise;
    }

    /**
     * Handles request progress
     *
     * @param {ProgressEvent}        e
     * @param {ProgressCallbackType} callback
     * @param {Function}             abortFn
     */
    protected onProgress(
        e: ProgressEvent,
        callback: ProgressCallbackType,
        abortFn: () => void
    ) {
        const xhr = e.target as XMLHttpRequest;
        const type = e.type;
        let progress = 0;

        if (type === 'progress') {
            if (e.lengthComputable) {
                progress = Math.floor((e.loaded / e.total) * 100);

                // set to 100 only at loadend
                // to not to duplicate 100 progress twice
                if (progress === 100) {
                    return;
                }
            } else {
                // unbind further progress events
                xhr.onprogress = () => {};
                // console.log('length is not computable');
                return;
            }
        }

        if (type === 'loadend') {
            // set 100 only on success responses
            const status = xhr.status;
            if (status > 199 && status < 309) {
                progress = 100;
            }
        }

        callback(progress, abortFn);
    }

}

/**
 * Sets XHR headers
 *
 * @param {XMLHttpRequest}   xhr
 * @param {HeadersInterface} headers
 */
function setXHRHeaders(xhr: XMLHttpRequest, headers: Headers) {
    let h = headers.getAll();
    for (let name in h) {
        let value = h[name];
        if (Array.isArray(value)) {
            value.forEach(function(v) {
                xhr.setRequestHeader(name, v);
            });
        } else {
            xhr.setRequestHeader(name, value);
        }
    };
    return xhr;
}

/**
 * Formats request payload according to Content-Type header
 *
 * @param {string}           text
 * @param {HeadersInterface} headers
 */
function formatPayload(payload: any, headers: Headers) {
    const header = 'content-type';
    try {
        // keep as-is
        if (payload === undefined
            || payload instanceof FormData
            || payload instanceof ArrayBuffer
            || payload instanceof Blob
        ) {
            // contuinue

        // json
        } else if (headers.matches(header, '\/json[;\b]?')) {
            payload = JSON.stringify(payload);

        // urlencoded form
        } else if (headers.matches(header, 'application\/x-www-form-urlencoded')) {
            payload = QueryString.encode(payload, {arrayMode: 'brackets'});
        }

        return payload;

    } catch (e) {
        throw new Error(
            'Failed to format payload according to content type "' +
            headers.get(header) + '": ' + (e.message || e)
        );
    }
}

export type UrlInterceptorType = (url: string) => string;

export type OptionsInterceptorType = (options: OptionsInterface) => OptionsInterface;

export type ResponseInterceptorType = (response: ResponseInterface) => ResponseInterface;