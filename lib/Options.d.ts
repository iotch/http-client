import { ResponseInterface } from './Response';
import { HeadersObjectInterface } from './Headers';
export default class Options {
    /**
     * {@inheritdoc}
     */
    method: MethodType;
    /**
     * {@inheritdoc}
     */
    search?: any;
    /**
     * {@inheritdoc}
     */
    payload?: any;
    /**
     * {@inheritdoc}
     */
    timeout: number;
    /**
     * {@inheritdoc}
     */
    responseType: ResponseType;
    /**
     * {@inheritdoc}
     */
    headers?: HeadersObjectInterface;
    /**
     * {@inheritdoc}
     */
    username?: string;
    /**
     * {@inheritdoc}
     */
    password?: string;
    /**
     * {@inheritdoc}
     */
    withCredentials: boolean;
    /**
     * {@inheritdoc}
     */
    onSend?: SendCallbackType;
    /**
     * {@inheritdoc}
     */
    onLoad?: LoadCallbackType;
    /**
     * {@inheritdoc}
     */
    onError?: ErrorCallbackType;
    /**
     * {@inheritdoc}
     */
    onProgress?: ProgressCallbackType;
    /**
     * @param {OptionsInterface} options
     */
    constructor(options?: OptionsInterface);
    /**
     * Merges in new options
     *
     * @param  {OptionsInterface} options
     * @return {self}
     */
    merge(options: OptionsInterface): this;
}
/**
 * Options interface
 */
export interface OptionsInterface {
    /**
     * Http method
     */
    method?: MethodType;
    /**
     * Http query object that will be urlencoded and appended to url
     */
    search?: any;
    /**
     * Request body that will be formatted according to 'content-type' header
     */
    payload?: any;
    /**
     * Request timeout in ms
     */
    timeout?: number;
    /**
     * Expected format of the response body
     * {@link https://xhr.spec.whatwg.org/#the-responsetype-attribute}
     */
    responseType?: ResponseType;
    /**
     * Request headers
     */
    headers?: HeadersObjectInterface;
    /**
     * Whether or not cross-site Access-Control requests should be made
     * using credentials such as cookies, authorization headers or TLS client certificates
     */
    withCredentials?: boolean;
    /**
     * The optional user name to use for authentication purposes
     */
    username?: string;
    /**
     * The optional password to use for authentication purposes
     */
    password?: string;
    /**
     * Fires on request sent
     */
    onSend?: SendCallbackType;
    /**
     * Fires when any valid response received
     */
    onLoad?: LoadCallbackType;
    /**
     * Fires when error occurs during request
     * (timeouts, network errors, response parse errors, etc)
     */
    onError?: ErrorCallbackType;
    /**
     * Fires on download/upload progress
     */
    onProgress?: ProgressCallbackType;
}
export declare type MethodType = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';
export declare type ResponseType = 'text' | 'json' | 'arraybuffer' | 'blob' | 'document';
export declare type HeadersObjectInterface = HeadersObjectInterface;
export declare type SendCallbackType = () => void;
export declare type LoadCallbackType = (response: ResponseInterface) => void;
export declare type ProgressCallbackType = (progress: number, abortFn: () => void) => void;
export declare type ErrorCallbackType = (error: {
    code: string;
    reason?: any;
}) => void;
