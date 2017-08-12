"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Options = (function () {
    /**
     * @param {OptionsInterface} options
     */
    function Options(options) {
        /**
         * {@inheritdoc}
         */
        this.method = 'GET';
        /**
         * {@inheritdoc}
         */
        this.timeout = 0;
        /**
         * {@inheritdoc}
         */
        this.responseType = 'text';
        /**
         * {@inheritdoc}
         */
        this.withCredentials = false;
        options && this.merge(options);
    }
    /**
     * Merges in new options
     *
     * @param  {OptionsInterface} options
     * @return {self}
     */
    Options.prototype.merge = function (options) {
        var self = this;
        var currentHeaders = self.headers;
        var headers = options.headers;
        for (var name_1 in options) {
            var value = options[name_1];
            if (value !== undefined) {
                if (name_1 === 'headers') {
                    self.headers = tslib_1.__assign({}, currentHeaders, headers);
                }
                else {
                    self[name_1] = value;
                }
            }
        }
        return self;
    };
    return Options;
}());
exports.default = Options;
