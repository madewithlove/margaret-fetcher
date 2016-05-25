import expect from 'expect';
import fetchMock from 'fetch-mock';
import AbstractRequest from '../src/AbstractRequest';
import 'babel-polyfill';

describe('AbstractRequest', () => {
    let requests;

    fetchMock.mock('http://google.com/foo', '{"foo":"bar"}');
    fetchMock.mock('http://google.com/bar', 500);
    fetchMock.mock('http://google.com/options', (url, options) => ({url, options}));
    fetchMock.mock('http://google.com/options?include=foo,bar', (url, options) => ({url, options}));
    fetchMock.mock('http://google.com/options?foo=bar&baz=qux', (url, options) => ({url, options}));
    fetchMock.mock('http://google.com/options?foo[]=bar&foo[]=baz', (url, options) => ({url, options}));
    fetchMock.mock('http://google.com/token', new Response({}, {
        headers: {
            Authorization: 'Bearer foo',
        }
    }));

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
                expect(error.message).toContain('Unexpected');
                expect(fetchMock.calls().matched.length).toBe(1);
            });
        });

        it('can define includes', () => {
            requests.includes = ['foo', 'bar'];

            return requests.post('options').then(response => {
                expect(response.url).toBe('http://google.com/options?include=foo,bar');
                expect(fetchMock.calls().matched.length).toBe(1);
            });
        });

        it('can allow custom middleware', () => {
            const extractAuthorizationHeader = response => {
                expect(response.headers.get('Authorization')).toBe('Bearer foo');
            };

            requests.middleware = [extractAuthorizationHeader];

            return requests.get('token');
        });

        it('can specify additional query parameters', () => {
            requests
                .withQueryParameter('foo', 'bar')
                .withQueryParameters({baz: 'qux'});

            return requests.post('options').then(response => {
                expect(response.url).toBe('http://google.com/options?foo=bar&baz=qux');
                expect(fetchMock.calls().matched.length).toBe(1);
            });
        });

        it('can replace query parameters', () => {
            requests.withQueryParameter('a', 'b');
            requests.setQueryParameters({foo: 'bar', baz: 'qux'});

            return requests.post('options').then(response => {
                expect(response.url).toBe('http://google.com/options?foo=bar&baz=qux');
                expect(fetchMock.calls().matched.length).toBe(1);
            });
        });

        it('can specify array query parameters', () => {
            requests.setQueryParameters({foo: ['bar', 'baz']});

            return requests.post('options').then(response => {
                expect(response.url).toBe('http://google.com/options?foo[]=bar&foo[]=baz');
                expect(fetchMock.calls().matched.length).toBe(1);
            });
        });
    });

    describe('#fetch', () => {
        it('can make raw fetch request', () => {
            var body = {
                method: 'POST',
                body: {foo: 'bar'}
            };

            return requests.fetch('options', body).then(response => {
                expect(response.data.options.headers).toBe(undefined);
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
                .make('options', {headers: {Bar: 'Baz'}})
                .then(response => {
                    expect(response.data.options.headers.Foo).toBe('Bar');
                    expect(response.data.options.headers.Bar).toBe('Baz');
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

        it('can use callables as options', () => {
            return requests
                .withOptions({
                    headers: {
                        foo: options => options.bar,
                        bar: 'baz',
                    },
                })
                .make('options')
                .then(response => {
                    expect(response.data.options.method).toBe('GET');
                    expect(response.data.options.headers.foo).toBe('baz');
                });
        });
    });
});
