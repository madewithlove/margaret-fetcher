import fetch from 'isomorphic-fetch';
import merge from 'merge';

export default class AbstractRequest {

    /**
     * @type {Array}
     */
    includes = [];

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
            'Accept':       'application/json',
            'Content-Type': 'application/json',
        },
    };

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
        const requestOptions = merge.recursive(this.options, options);

        // Parse promise if need be
        let promise = fetch(endpoint, requestOptions).then(::this.checkStatus);
        if (requestOptions.method !== 'DELETE') {
            promise = promise.then(::this.parseJSON);
        }

        return promise;
    }

    //////////////////////////////////////////////////////////////////////
    ////////////////////////////// OPTIONS ///////////////////////////////
    //////////////////////////////////////////////////////////////////////

    /**
     * Set the default options for all requests
     *
     * @param {Object} options
     */
    setOptions(options) {
        this.options = options;
    }

    /**
     * Merge some options to the defaults
     *
     * @param {Object} options
     */
    withOptions(options) {
        this.options = merge.recursive(this.options, options);
    }

    //////////////////////////////////////////////////////////////////////
    ////////////////////////////// HANDLERS //////////////////////////////
    //////////////////////////////////////////////////////////////////////

    /**
     * Parse the contents of a JSON response
     *
     * @param {String} response
     *
     * @returns {Object}
     */
    parseJSON(response) {
        return response.json().then(data => ({
            status: response.status,
            data,
        }));
    }

    /**
     * Check the status of the response
     *
     * @param {Object} response
     *
     * @returns {Object}
     */
    checkStatus(response) {
        if (response.status < 200 && response.status >= 300) {
            const error = new Error(response.statusText);
            error.response = response;

            throw error;
        }

        return response;
    }

    //////////////////////////////////////////////////////////////////////
    ////////////////////////////// REQUESTS //////////////////////////////
    //////////////////////////////////////////////////////////////////////

    get(url) {
        return this.make(url, {method: 'GET'});
    }

    put(url, payload) {
        return this.make(url, {
            method: 'PUT',
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
        return this.make(url, {method: 'DELETE'});
    }
}
