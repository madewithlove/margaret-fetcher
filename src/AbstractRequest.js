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
        method:  'GET',
        type:    'json',
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
        const requestOptions = merge.recursive(true, this.options, options);

        // Parse promise if need be
        let promise = fetch(endpoint, requestOptions);
        if (requestOptions.method !== 'DELETE') {
            promise = promise.then(::this.parseJSON);
        }
        else {
            promise = promise.then(::this.checkStatus);
        }

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
        this.options = merge.recursive(true, this.options, options);
    }

    /**
     * @param {String} token
     */
    withBearerToken(token) {
        this.withOptions({
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
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
        return response.json().then(data => {
            response.data = data;

            if (response.ok) {
                return response;
            }

            let error = new Error(response.statusText);
            error.response = response;
            error.data = data;

            throw error;
        });
    }

    /**
     * Check the status of the response
     *
     * @param {Object} response
     *
     * @returns {Object}
     */
    checkStatus(response) {
        if (response.ok) {
            return response;
        }

        let error = new Error(response.statusText);
        error.response = response;

        throw error;
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
            body:   JSON.stringify(payload),
        });
    }

    post(url, payload) {
        return this.make(url, {
            method: 'POST',
            body:   JSON.stringify(payload),
        });
    }

    delete(url) {
        return this.make(url, {method: 'DELETE'});
    }
}
