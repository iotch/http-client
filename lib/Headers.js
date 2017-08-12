"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Headers = (function () {
    /**
     * Parses raw headers
     *
     * @param {object} raw
     */
    function Headers(raw) {
        this.parsed = parseRaw(raw);
    }
    /**
     * Checks if header is set
     *
     * @param  {string}  name
     * @return {boolean}
     */
    Headers.prototype.has = function (name) {
        return this.parsed[normalizeName(name)] !== undefined;
    };
    /**
     * Gets header value by name
     *
     * @param  {string} name
     * @param  {any}    def
     * @return {any}
     */
    Headers.prototype.get = function (name, def) {
        if (def === void 0) { def = null; }
        var found = this.parsed[normalizeName(name)];
        return typeof found === 'string' || Array.isArray(found) ? found : def;
    };
    /**
     * Sets header value by name
     *
     * @param {string} name
     * @param {string | string[]} value
     * @return {self}
     */
    Headers.prototype.set = function (name, value) {
        if (name !== '' && value !== '') {
            this.parsed[normalizeName(name)] = value;
        }
        return this;
    };
    /**
     * Adds header value by name
     *
     * @param {string}            name
     * @param {string | string[]} value
     * @return {self}
     */
    Headers.prototype.add = function (name, value) {
        var current = this.get(name);
        if (current === null) {
            return this.set(name, value);
        }
        this.parsed[normalizeName(name)] = [].concat(current, value);
        return this;
    };
    /**
     * Removes header value by name
     *
     * @param {string} name
     * @param {string} valueToRemove
     * @return {self}
     */
    Headers.prototype.remove = function (name, valueToRemove) {
        var that = this;
        var parsed = that.parsed;
        var normalizedName = normalizeName(name);
        var value = parsed[normalizedName];
        if (!value) {
            return that;
        }
        if (typeof value === 'string' || !valueToRemove) {
            delete parsed[normalizedName];
            return that;
        }
        var idx = value.indexOf(valueToRemove);
        idx >= 0 && value.splice(idx, 1);
        if (value.length === 1) {
            parsed[normalizedName] = value.join('');
        }
        if (!parsed[normalizedName].length) {
            delete parsed[normalizedName];
        }
        return that;
    };
    /**
     * Gets headers object
     *
     * @return {Object}
     */
    Headers.prototype.getAll = function () {
        return tslib_1.__assign({}, this.parsed);
    };
    /**
     * Checks if header value matches pattern
     *
     * @param  {string}    name
     * @param  {string}    pattern
     * @param  {string}    flags
     * @return {boolean}
     */
    Headers.prototype.matches = function (name, pattern, flags) {
        var value = this.get(name);
        if (value === null) {
            return false;
        }
        return new RegExp(pattern, flags).test(value);
    };
    return Headers;
}());
exports.default = Headers;
/**
 * Normalizes header name
 *
 * @param  {string} name
 * @return {string}
 */
function normalizeName(name) {
    var sep = '-';
    return name.split(sep).map(function (str) { return str.charAt(0).toUpperCase() + str.slice(1); }).join(sep);
}
/**
 * Parses raw headers string or object
 *
 * @param  {string|HeadersObjectInterface}  raw
 * @return {HeadersObjectInterface}
 */
function parseRaw(raw) {
    try {
        var sep_1 = ':';
        var comma_1 = ',';
        var parsed_1 = Object.create(null);
        if (typeof raw === 'string') {
            if (!raw.length) {
                return parsed_1;
            }
            var pairs = raw.trim().split('\n');
            pairs.forEach(function (row) {
                var split = row.trim().split(sep_1);
                var name = normalizeName((split.shift() || '').trim());
                var value = split.join(sep_1).trim();
                if (value.indexOf(comma_1) >= 0) {
                    var values = value
                        .split(comma_1)
                        .filter(Boolean)
                        .map(function (value) { return value.trim(); });
                    parsed_1[name] = values;
                }
                else {
                    parsed_1[name] = value;
                }
            });
        }
        else {
            for (var name_1 in raw) {
                if (raw.hasOwnProperty(name_1) && raw[name_1] !== '' && raw[name_1] !== null) {
                    parsed_1[normalizeName(name_1)] = raw[name_1];
                }
            }
        }
        return parsed_1;
    }
    catch (e) {
        throw new Error('Failed to parse headers: ' + e.message);
    }
}
