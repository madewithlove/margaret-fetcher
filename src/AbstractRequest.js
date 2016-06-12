import 'isomorphic-fetch';
import mapValues from 'lodash/mapValues';
import merge from 'lodash/merge';
import {buildQueryString} from './Helpers';

export default class AbstractRequest {

    /**
     * @type {Array}
     */
    includes = [];

    /**
     * @type {Array}
     */
    middleware = [];

    /**
     * The default options
     *
     * @type {Object}
     */
    options = {
        method: 'GET',
    };

    /**
     * The default query parameters
     *
     * @type {Object}
     */
    query = {};

    /**
     * @type {string}
     */
    rootUrl = '/api';

    /**
     * @param {String} url
     *
     * @return {String}
     */
    buildEndpoint(url) {
        if (this.includes.length) {
            this.query.include = this.includes.join(',');
        }

        return `${this.rootUrl}/${url}${buildQueryString(this.query)}`;
    }

    /**
     * @param {Object} options
     *
     * @return {Object}
     */
    buildOptions(options) {
        return mapValues(options, value => {
            switch (typeof value) {
                case 'function':
                    return value(options);

                case 'object':
                    return this.buildOptions(value);

                default:
                    return value;
            }
        });
    }

    /**
     * Make a request somewhere
     *
     * @param {String} url
     * @param {Object} options
     *
     * @returns {Promise}
     */
    make(url, options = {}) {
        let body = merge(this.options, options);
        body = this.buildOptions(body);

        return this.fetch(url, body);
    }

    /**
     * Make a raw fetch request
     *
     * @param {String} url
     * @param {Object} body
     *
     * @returns {Promise}
     */
    fetch(url, body = {}) {
        const endpoint = this.buildEndpoint(url);
        let promise = fetch(endpoint, body);

        this.middleware.forEach(middleware => {
            promise = promise.then(middleware);
        });

        // Catch errors
        promise = promise.catch(error => {
            console.warn(error);
            throw error;
        });

        return promise;
    }

    //////////////////////////////////////////////////////////////////////
    ////////////////////////////// OPTIONS ///////////////////////////////
    //////////////////////////////////////////////////////////////////////

    /**
     * Set the default options for all requests
     *
     * @param {Object} options
     *
     * @return {AbstractRequest}
     */
    setOptions(options) {
        this.options = options;

        return this;
    }

    /**
     * Merge some options to the defaults
     *
     * @param {Object} options
     *
     * @return {AbstractRequest}
     */
    withOptions(options) {
        this.options = merge(this.options, options);

        return this;
    }

    /**
     * @param {String} token
     *
     * @return {AbstractRequest}
     */
    withBearerToken(token) {
        return this.withOptions({
            headers: {
                Authorization: options => {
                    return `Bearer ${typeof token === 'function' ? token(options) : token}`;
                },
            },
        });
    }

    //////////////////////////////////////////////////////////////////////
    ////////////////////////// QUERY PARAMETERS //////////////////////////
    //////////////////////////////////////////////////////////////////////

    /**
     * @param {Object} parameters
     *
     * @return {AbstractRequest}
     */
    setQueryParameters(parameters) {
        this.query = parameters;

        return this;
    }

    /**
     * @param {String} key
     * @param {String} value
     *
     * @return {AbstractRequest}
     */
    withQueryParameter(key, value) {
        this.query[key] = value;

        return this;
    }

    /**
     * @param {Object} parameters
     *
     * @return {AbstractRequest}
     */
    withQueryParameters(parameters) {
        this.query = merge(this.query, parameters);

        return this;
    }

    //////////////////////////////////////////////////////////////////////
    ////////////////////////////// REQUESTS //////////////////////////////
    //////////////////////////////////////////////////////////////////////

    get(url) {
        return this.make(url, {
            method: 'GET',
        });
    }

    put(url, payload) {
        return this.make(url, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
    }

    patch(url, payload) {
        return this.make(url, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
    }

    post(url, payload) {
        return this.make(url, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    delete(url) {
        return this.make(url, {
            method: 'DELETE',
        });
    }
}
