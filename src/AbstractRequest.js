import merge from 'merge';
import 'isomorphic-fetch';

export default class AbstractRequest {

    /**
     * @type {Array}
     */
    includes = [];

    /**
     * @type {Array}
     */
    middlewares = [];

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

    constructor() {
        this.middlewares = [
            ::this.parseJSON,
        ];
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
        // Prepare payload
        const includes = this.includes.length ? `?include=${this.includes.join(',')}` : '';
        const endpoint = `${this.rootUrl}/${url}${includes}`;
        const requestOptions = merge.recursive(true, this.options, options);

        // Parse promise if need be
        let promise = fetch(endpoint, requestOptions);

        this.middlewares.forEach(middleware => {
            promise = promise.then(middleware);
        });

        // Catch errors
        promise = promise.catch(error => {
            console.log(error);
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
    ////////////////////////////// HANDLERS //////////////////////////////
    //////////////////////////////////////////////////////////////////////

    /**
     * Parse the contents of a JSON response.
     *
     * @param {String} response
     *
     * @returns {Object}
     */
    parseJSON(response) {
        if (response.status === 204) {
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
