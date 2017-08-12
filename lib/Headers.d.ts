export default class Headers {
    /**
     * Parsed headers object
     * @type {HeadersObjectInterface}
     */
    private parsed;
    /**
     * Parses raw headers
     *
     * @param {object} raw
     */
    constructor(raw: string | HeadersObjectInterface);
    /**
     * Checks if header is set
     *
     * @param  {string}  name
     * @return {boolean}
     */
    has(name: string): boolean;
    /**
     * Gets header value by name
     *
     * @param  {string} name
     * @param  {any}    def
     * @return {any}
     */
    get(name: string, def?: any): any;
    /**
     * Sets header value by name
     *
     * @param {string} name
     * @param {string | string[]} value
     * @return {self}
     */
    set(name: string, value: string | string[]): this;
    /**
     * Adds header value by name
     *
     * @param {string}            name
     * @param {string | string[]} value
     * @return {self}
     */
    add(name: string, value: string | string[]): this;
    /**
     * Removes header value by name
     *
     * @param {string} name
     * @param {string} valueToRemove
     * @return {self}
     */
    remove(name: string, valueToRemove?: string): this;
    /**
     * Gets headers object
     *
     * @return {Object}
     */
    getAll(): {
        [name: string]: string | string[];
    };
    /**
     * Checks if header value matches pattern
     *
     * @param  {string}    name
     * @param  {string}    pattern
     * @param  {string}    flags
     * @return {boolean}
     */
    matches(name: string, pattern: any, flags?: string): boolean;
}
export interface HeadersObjectInterface {
    [name: string]: string | string[];
}
export interface HeadersInterface extends Headers {
}
