import 'isomorphic-fetch';
import filter from 'lodash/filter';
import map from 'lodash/map';
import merge from 'merge';
import {NO_CONTENT} from './HttpStatusCodes';

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
     * @type {string}
     */
    rootUrl = '/api';

    /**
     * The default options
     *
     * @type {Object}
     */
    options = {
        method: 'GET',
        type: 'json',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    };

    /**
     * The default query parameters
     *
     * @type {Object}
     */
    query = {};

    constructor() {
        this.middleware = [
            ::this.parseJSON,
        ];
    }

    /**
     * @param {String} url
     *
     * @return {String}
     */
    buildEndpoint(url) {
        this.query.include = this.includes.join(',');

        // Build query parameters
        let parameters = map(this.query, (value, key) => {
            if (typeof value === 'object') {
                return value.map(subvalue => `${key}[]=${subvalue}`).join('&');
            }

            return value ? `${key}=${value}` : null;
        });
        parameters = filter(parameters);

        // Build endpoint
        let endpoint = `${this.rootUrl}/${url}`;
        if (parameters.length) {
            endpoint += '?';
        }

        // Add query parameters
        endpoint += parameters.join('&');

        return endpoint;
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
        const body = merge.recursive(true, this.options, options);

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
        this.options = merge.recursive(true, this.options, options);

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
                Authorization: `Bearer ${token}`,
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
    ///////////////////////////// MIDDLEWARES ////////////////////////////
    //////////////////////////////////////////////////////////////////////

    /**
     * Parse the contents of a JSON response.
     *
     * @param {Response} response
     *
     * @returns {Response}
     */
    parseJSON(response) {
        if (response.status === NO_CONTENT) {
            if (response.ok) {
                return response;
            }

            const error = new Error(response.statusText);
            error.response = response;

            throw error;
        }

        return response.json().then(data => {
            response.data = data;

            if (response.ok) {
                return response;
            }

            const error = new Error(response.statusText);
            error.response = response;
            error.data = data;

            throw error;
        });
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
