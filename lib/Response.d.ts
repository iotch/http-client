import Headers from './Headers';
export default class Response {
    /**
     * {@inheritdoc}
     */
    status: number;
    /**
     * {@inheritdoc}
     */
    isSuccessStatus: boolean;
    /**
     * {@inheritdoc}
     */
    statusText: string;
    /**
     * {@inheritdoc}
     */
    type: string;
    /**
     * {@inheritdoc}
     */
    body: any;
    /**
     * {@inheritdoc}
     */
    readonly headers: Headers;
    /**
     * {@inheritdoc}
     */
    error: boolean;
    /**
     * {@inheritdoc}
     */
    errorText: string;
    /**
     * @param {Event} e
     */
    constructor(e: Event);
}
export interface ResponseInterface extends Response {
}
