export default class Headers {

    /**
     * Parsed headers object
     * @type {HeadersObjectInterface}
     */
    private parsed: HeadersObjectInterface;

    /**
     * Parses raw headers
     *
     * @param {object} raw
     */
    public constructor(raw: string | HeadersObjectInterface) {
        this.parsed = parseRaw(raw);
    }

    /**
     * Checks if header is set
     *
     * @param  {string}  name
     * @return {boolean}
     */
    public has(name: string) {
        return this.parsed[normalizeName(name)] !== undefined;
    }

    /**
     * Gets header value by name
     *
     * @param  {string} name
     * @param  {any}    def
     * @return {any}
     */
    public get(name: string, def: any = null) {
        const found = this.parsed[normalizeName(name)];
        return typeof found === 'string' || Array.isArray(found) ? found : def;
    }

    /**
     * Sets header value by name
     *
     * @param {string} name
     * @param {string | string[]} value
     * @return {self}
     */
    public set(name: string, value: string | string[]) {
        if(name !== '' && value !== '') {
            this.parsed[normalizeName(name)] = value;
        }
        return this;
    }

    /**
     * Adds header value by name
     *
     * @param {string}            name
     * @param {string | string[]} value
     * @return {self}
     */
    public add(name: string, value: string | string[]) {
        const current = this.get(name);

        if (current === null) {
            return this.set(name, value);
        }

        this.parsed[normalizeName(name)] = ([] as string[]).concat(current, value);
        return this;
    }

    /**
     * Removes header value by name
     *
     * @param {string} name
     * @param {string} valueToRemove
     * @return {self}
     */
    public remove(name: string, valueToRemove?: string) {
        const that = this;
        const parsed = that.parsed;
        const normalizedName = normalizeName(name);
        const value = parsed[normalizedName];

        if(!value) {
            return that;
        }

        if(typeof value === 'string' || !valueToRemove) {
            delete parsed[normalizedName];
            return that;
        }

        const idx = value.indexOf(valueToRemove);
        idx >= 0 && value.splice(idx, 1);

        if(value.length === 1) {
            parsed[normalizedName] = value.join('');
        }

        if(!parsed[normalizedName].length) {
            delete parsed[normalizedName];
        }

        return that;
    }

    /**
     * Gets headers object
     *
     * @return {Object}
     */
    public getAll() {
        return { ...this.parsed };
    }

    /**
     * Checks if header value matches pattern
     *
     * @param  {string}    name
     * @param  {string}    pattern
     * @param  {string}    flags
     * @return {boolean}
     */
    public matches(name: string, pattern: any, flags?: string) {
        const value = this.get(name);
        if (value === null) {
            return false;
        }

        return new RegExp(pattern, flags).test(value);
    }
}

/**
 * Normalizes header name
 *
 * @param  {string} name
 * @return {string}
 */
function normalizeName(name: string) {
    const sep = '-';
    return name.split(sep).map((str) => str.charAt(0).toUpperCase() + str.slice(1)).join(sep);
}

/**
 * Parses raw headers string or object
 *
 * @param  {string|HeadersObjectInterface}  raw
 * @return {HeadersObjectInterface}
 */
function parseRaw(raw: string | HeadersObjectInterface) {

    try {
        const sep = ':';
        const comma = ',';
        const parsed: HeadersObjectInterface = Object.create(null);

        if (typeof raw === 'string') {

            if (!raw.length) {
                return parsed;
            }

            const pairs = raw.trim().split('\n');

            pairs.forEach((row) => {
                const split = row.trim().split(sep);
                const name = normalizeName((split.shift() || '').trim());

                let value = split.join(sep).trim();

                if(value.indexOf(comma) >= 0) {
                    const values = value
                        .split(comma)
                        .filter(Boolean)
                        .map((value) => value.trim());
                    parsed[name] = values;
                } else {
                    parsed[name] = value;
                }
            });

        } else {
            for (let name in raw) {
                if (raw.hasOwnProperty(name) && raw[name] !== '' && raw[name] !== null) {
                    parsed[normalizeName(name)] = raw[name];
                }
            }
        }

        return parsed;

    } catch (e) {
        throw new Error('Failed to parse headers: ' + e.message);
    }
}

export interface HeadersObjectInterface {
    [name: string]: string | string[]
}

export interface HeadersInterface extends Headers { }