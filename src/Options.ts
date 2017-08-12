import { ResponseInterface } from './Response';
import { HeadersObjectInterface } from './Headers';

export default class Options {

    /**
     * {@inheritdoc}
     */
    public method: MethodType = 'GET';

    /**
     * {@inheritdoc}
     */
    public search?: any;

    /**
     * {@inheritdoc}
     */
    public payload?: any;

    /**
     * {@inheritdoc}
     */
    public timeout: number = 0;

    /**
     * {@inheritdoc}
     */
    public responseType: ResponseType = 'text';

    /**
     * {@inheritdoc}
     */
    public headers?: HeadersObjectInterface;

    /**
     * {@inheritdoc}
     */
    public username?: string;

    /**
     * {@inheritdoc}
     */
    public password?: string;

    /**
     * {@inheritdoc}
     */
    public withCredentials: boolean = false;

    /**
     * {@inheritdoc}
     */
    public onSend?: SendCallbackType;

    /**
     * {@inheritdoc}
     */
    public onLoad?: LoadCallbackType;

    /**
     * {@inheritdoc}
     */
    public onError?: ErrorCallbackType;

    /**
     * {@inheritdoc}
     */
    public onProgress?: ProgressCallbackType;

    /**
     * @param {OptionsInterface} options
     */
    public constructor(options?: OptionsInterface) {
        options && this.merge(options);
    }

    /**
     * Merges in new options
     *
     * @param  {OptionsInterface} options
     * @return {self}
     */
    public merge(options: OptionsInterface) {
        const self = this;
        const currentHeaders = self.headers;
        const headers = options.headers;

        for (let name in options) {
            const value = options[name];
            if (value !== undefined) {
                if(name === 'headers') {
                    self.headers = { ...currentHeaders, ...headers } as HeadersObjectInterface;
                } else {
                    self[name] = value;
                }
            }
        }

        return self;
    }
}

/**
 * Options interface
 */
export interface OptionsInterface {

    /**
     * Http method
     */
    method?: MethodType,

    /**
     * Http query object that will be urlencoded and appended to url
     */
    search?: any,

    /**
     * Request body that will be formatted according to 'content-type' header
     */
    payload?: any,

    /**
     * Request timeout in ms
     */
    timeout?: number,

    /**
     * Expected format of the response body
     * {@link https://xhr.spec.whatwg.org/#the-responsetype-attribute}
     */
    responseType?: ResponseType,

    /**
     * Request headers
     */
    headers?: HeadersObjectInterface,

    /**
     * Whether or not cross-site Access-Control requests should be made
     * using credentials such as cookies, authorization headers or TLS client certificates
     */
    withCredentials?: boolean,

    /**
     * The optional user name to use for authentication purposes
     */
    username?: string,

    /**
     * The optional password to use for authentication purposes
     */
    password?: string,

    /**
     * Fires on request sent
     */
    onSend?: SendCallbackType,

    /**
     * Fires when any valid response received
     */
    onLoad?: LoadCallbackType,

    /**
     * Fires when error occurs during request
     * (timeouts, network errors, response parse errors, etc)
     */
    onError?: ErrorCallbackType,

    /**
     * Fires on download/upload progress
     */
    onProgress?: ProgressCallbackType,
}


export type MethodType = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';

export type ResponseType = 'text' | 'json' | 'arraybuffer' | 'blob' | 'document';

export type HeadersObjectInterface = HeadersObjectInterface;

export type SendCallbackType = () => void;

export type LoadCallbackType = (response: ResponseInterface) => void;

export type ProgressCallbackType = (progress: number, abortFn: () => void) => void;

export type ErrorCallbackType = (error: {code: string, reason?: any}) => void;