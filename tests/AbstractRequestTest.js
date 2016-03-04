import expect from 'expect';
import fetchMock from 'fetch-mock';
import AbstractRequest from '../src/AbstractRequest';
import 'babel-polyfill';

describe('AbstractRequest', () => {
    let requests;

    fetchMock.mock('http://google.com/foo', '{"foo":"bar"}');
    fetchMock.mock('http://google.com/bar', 500);
    fetchMock.mock('http://google.com/options', (url, options) => {
        return {url, options};
    });

    beforeEach(() => {
        requests = new AbstractRequest();
        requests.rootUrl = 'http://google.com';
        fetchMock.reset();
    });

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
                expect(fetchMock.calls().matched.length).toBe(1);
            });
        });
    });

    describe('#put', () => {
        it('can make POST requests', () => {
            return requests.post('options', {foo: 'bar'}).then(response => {
                expect(response.data.options.method).toBe('POST');
                expect(response.data.options.body).toBe('{"foo":"bar"}');
            });
        });

        it('can make PATCH requests', () => {
            return requests.patch('options', {foo: 'bar'}).then(response => {
                expect(response.data.options.method).toBe('PATCH');
                expect(response.data.options.body).toBe('{"foo":"bar"}');
            });
        });

        it('can make PUT requests', () => {
            return requests.put('options', {foo: 'bar'}).then(response => {
                expect(response.data.options.method).toBe('PUT');
                expect(response.data.options.body).toBe('{"foo":"bar"}');
            });
        });
    });

    describe('#setOptions', () => {
        it('can replace options', () => {
            return requests
                .setOptions({headers: {Foo: 'Bar'}})
                .make('options')
                .then(response => {
                    expect(response.data.options.headers.Foo).toBe('Bar');
                });
        });
    });

    describe('#withOptions', () => {
        it('can add options', () => {
            return requests
                .withBearerToken('Foo')
                .make('options')
                .then(response => {
                    expect(response.data.options.method).toBe('GET');
                    expect(response.data.options.headers.Authorization).toBe('Bearer Foo');
                });
        });
    });
});
