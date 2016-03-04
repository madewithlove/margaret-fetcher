import expect from 'expect';
import fetchMock from 'fetch-mock';
import AbstractRequest from '../src/AbstractRequest';
import 'babel-polyfill';

describe('AbstractRequest', () => {
    const requests = new AbstractRequest();
    requests.rootUrl = 'http://google.com';

    fetchMock.mock('http://google.com/foo', '{"foo":"bar"}');
    fetchMock.mock('http://google.com/bar', 500);

    describe('#make', () => {
        it('can make basic JSON request', () => {
            return requests.make('foo').then(response => {
                expect(response.data.foo).toBe('bar');
                expect(fetchMock.calls().matched.length).toBe(1);
            });
        });

        it('can catch errors', () => {
            return requests.make('bar').catch(error => {
                expect(error.message).toBe('Unexpected end of input');
                expect(fetchMock.calls().matched.length).toBe(2);
            });
        });
    });
});
