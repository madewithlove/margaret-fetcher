import assert from 'assert';
import fetchMock from 'fetch-mock';
import {JsonRequest} from '../src';

describe('JsonRequest', () => {
    let requests;

    fetchMock.mock('http://google.com/options', (url, options) => ({url, options}));

    beforeEach(() => {
        requests = new JsonRequest();
        requests.rootUrl = 'http://google.com';
        fetchMock.reset();
    });

    describe('#put', () => {
        it('can make POST requests', () => {
            return requests.post('options', {foo: 'bar'}).then(response => {
                assert.equal(response.data.options.method, 'POST');
                assert.equal(response.data.options.body, '{"foo":"bar"}');
            });
        });

        it('can make PATCH requests', () => {
            return requests.patch('options', {foo: 'bar'}).then(response => {
                assert.equal(response.data.options.method, 'PATCH');
                assert.equal(response.data.options.body, '{"foo":"bar"}');
            });
        });

        it('can make PUT requests', () => {
            return requests.put('options', {foo: 'bar'}).then(response => {
                assert.equal(response.data.options.method, 'PUT');
                assert.equal(response.data.options.body, '{"foo":"bar"}');
            });
        });

        it('can make DELETE requests', () => {
            return requests.delete('options', {foo: 'bar'}).then(response => {
                assert.equal(response.data.options.method, 'DELETE');
                assert.equal(response.data.options.body, undefined);
            });
        });
    });
});
