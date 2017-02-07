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
    fetchMock.mock('http://google.com/html-error', new Promise(resolve => {
        resolve({
            status: 422,
            body: '<p>Error!</p>'
        });
    }));

    it('can parse a JSON response', () => {
        return fetch('http://google.com/foo').then(parseJson).then(response => {
            expect(response.data).toEqual({foo: 'bar'});
        });
    });

    it('does not crash on 204 responses', () => {
        return fetch('http://google.com/empty').then(parseJson).then(response => {
            expect(response.data).toBeFalsy();
        });
    });

    it('ignores empty responses', () => {
        return fetch('http://google.com/created').then(parseJson).then(response => {
            expect(response.data).toBeFalsy();
        });
    });

    it('can parse contents of error responses', () => {
        return fetch('http://google.com/error').then(parseJson).catch(response => {
            expect(response.message).toEqual('Unprocessable Entity');
            expect(response.data).toEqual({foo: 'bar'});
        });
    });

    it('can parse html error respnses', () => {
        return fetch('http://google.com/html-error').then(parseJson).catch(response => {
            expect(response.message).toEqual('Unprocessable Entity');
            expect(response.data).toEqual('<p>Error!</p>');
        })
    });
});
