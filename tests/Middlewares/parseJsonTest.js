import assert from 'assert';
import fetchMock from 'fetch-mock';
import {parseJson} from '../../src/Middlewares';

describe('parseJson', () => {
    fetchMock.mock('http://google.com/foo', '{"foo": "bar"}');
    fetchMock.mock('http://google.com/empty', 204);
    fetchMock.mock('http://google.com/created', 201);
    fetchMock.mock('http://google.com/error', new Promise(resolve => {
        resolve({
            status: 422,
            body: {
                foo: 'bar',
            }
        });
    }));

    it('can parse a JSON response', () => {
        return fetch('http://google.com/foo').then(parseJson).then(response => {
            assert.deepEqual(response.data, {foo: 'bar'});
        });
    });

    it('does not crash on 204 responses', () => {
        return fetch('http://google.com/empty').then(parseJson).then(response => {
            assert.equal(response.data, null);
        });
    });

    it('ignores empty responses', () => {
        return fetch('http://google.com/created').then(parseJson).then(response => {
            assert.equal(response.data, null);
        });
    });

    it('can parse contents of error responses', () => {
        return fetch('http://google.com/error').then(parseJson).catch(response => {
            assert.equal(response, 'Error: Unprocessable Entity');
            assert.deepEqual(response.data, {foo: 'bar'});
        });
    });
});
