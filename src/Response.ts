import Headers from './Headers';

export default class Response {

    /**
     * {@inheritdoc}
     */
    public status: number = 0;

    /**
     * {@inheritdoc}
     */
    public isSuccessStatus: boolean = false;

    /**
     * {@inheritdoc}
     */
    public statusText: string = '';

    /**
     * {@inheritdoc}
     */
    public type: string = '';

    /**
     * {@inheritdoc}
     */
    public body: any = null;

    /**
     * {@inheritdoc}
     */
    public readonly headers: Headers;

    /**
     * {@inheritdoc}
     */
    public error: boolean = false;

    /**
     * {@inheritdoc}
     */
    public errorText: string = '';

    /**
     * @param {Event} e
     */
    public constructor(e: Event) {
        const self = this;

        const eventType = e.type;
        const xhr = e.target as XMLHttpRequest;
        const status = xhr.status;

        switch (eventType) {
            case ('error'):
            case ('abort'):
            case ('timeout'):
                self.error = true;
                self.errorText = eventType;
                break;
        }

        this.headers = new Headers(xhr.getAllResponseHeaders());
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
}


/**
 * Formats text response according to Content-Type header
 *
 * @param {string}  text
 * @param {Headers} headers
 */
function formatResponse(text: string, headers: Headers) {
    try {
        const name = 'content-type';
        if (headers.matches(name, '\/json[;\b]*?')) {
            const parsed = JSON.parse(text);
            return parsed;
        }

        return text;

    } catch (e) {
        throw new Error(
            'Failed to format response text according to content type "' +
            headers.get(name) + '": ' + (e.message || e)
        );
    }
}

export interface ResponseInterface extends Response {}