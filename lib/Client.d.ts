import 'es6-promise/auto';
import { OptionsInterface, ProgressCallbackType } from './Options';
import { ResponseInterface } from './Response';
/**
 * XMLHttpRequest2 wrapper with basic progress support
 */
export default class Client {
    /**
     * Error codes
     * @type {object}
     */
    readonly errorCodes: {
        NETWORK_ERROR: string;
        NETWORK_TIMEOUT: string;
        REQUEST_ABORTED: string;
        LOAD_ERROR: string;
        CLIENT_ERROR: string;
    };
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
    constructor(options?: OptionsInterface);
    /**
     * Sets the url intercepting function
     *
     * @param {UrlInterceptorType} interceptor
     */
    interceptUrl(interceptor: UrlInterceptorType): void;
    /**
     * Sets the options intercepting function
     *
     * @param {OptionsInterceptorType} interceptor
     */
    interceptOptions(interceptor: OptionsInterceptorType): void;
    /**
     * Sets the response intercepting function
     *
     * @param {ResponseInterceptorType} interceptor
     */
    interceptResponse(interceptor: ResponseInterceptorType): void;
    /**
     * Creates request
     *
     * @param {string}           url
     * @param {OptionsInterface} localOptions
     */
    request(url: string, localOptions?: OptionsInterface): Promise<ResponseInterface>;
    /**
     * Handles request progress
     *
     * @param {ProgressEvent}        e
     * @param {ProgressCallbackType} callback
     * @param {Function}             abortFn
     */
    protected onProgress(e: ProgressEvent, callback: ProgressCallbackType, abortFn: () => void): void;
}
export declare type UrlInterceptorType = (url: string) => string;
export declare type OptionsInterceptorType = (options: OptionsInterface) => OptionsInterface;
export declare type ResponseInterceptorType = (response: ResponseInterface) => ResponseInterface;
