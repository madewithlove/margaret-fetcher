import assert from 'assert';
import fetchMock from 'fetch-mock';
import AbstractRequest from '../src/AbstractRequest';
import {parseJson} from '../src/Middlewares';

class DummySubrequest extends AbstractRequest {
    resource = 'articles';

    show(id) {
        return this.get(`${this.resource}/${id}`);
    }
}

describe('AbstractRequest', () => {
    let requests;

    fetchMock.mock('/api/users/1/articles/1', '{"name":"article"}');

    fetchMock.mock('http://google.com/foo', '{"foo":"bar"}');
    fetchMock.mock('http://google.com/bar', 500);
    fetchMock.mock('http://google.com/options', (url, options) => ({url, options}));
    fetchMock.mock('/api/options', (url, options) => ({url, options}));
    fetchMock.mock('http://google.com/options?include[]=foo&include[]=bar', (url, options) => ({url, options}));
    fetchMock.mock('http://google.com/options?foo=bar&baz=qux', (url, options) => ({url, options}));
    fetchMock.mock('http://google.com/options?foo[]=bar&foo[]=baz', (url, options) => ({url, options}));
    fetchMock.mock('http://google.com/token', new Response({}, {
        headers: {
            Authorization: 'Bearer foo',
        },
    }));
    fetchMock.mock('http://google.com/foo/bar/options', (url, options) => ({url, options}));

    beforeEach(() => {
        requests = new AbstractRequest();
        requests.rootUrl = 'http://google.com';
        requests.middlewares = [parseJson];
        fetchMock.reset();
    });

    describe('#make', () => {
        it('can catch errors', () => {
            return requests.make('bar').catch(error => {
                assert.equal(error.message.includes('Unexpected'), true);
                assert.equal(fetchMock.calls().matched.length, 1);
            });
        });

        it('can define includes', () => {
            requests.withQueryParameter('include', ['foo', 'bar']);

            return requests.post('options').then(response => {
                assert.equal(response.url, 'http://google.com/options?include[]=foo&include[]=bar');
                assert.equal(fetchMock.calls().matched.length, 1);
            });
        });

        it('can allow custom middlewares', () => {
            const extractAuthorizationHeader = response => {
                assert.equal(response.headers.get('Authorization'), 'Bearer foo');
            };

            return requests.withMiddleware(extractAuthorizationHeader).get('token');
        });

        it('can bypass middlewares', () => {
            return requests.withoutMiddlewares().get('foo')
                .then(response => response.text())
                .then(response => {
                    assert.equal(response, '{"foo":"bar"}');
                });
        });

        it('can specify additional query parameters', () => {
            requests
                .withQueryParameter('foo', 'bar')
                .withQueryParameters({baz: 'qux'});

            return requests.post('options').then(response => {
                assert.equal(response.url, 'http://google.com/options?foo=bar&baz=qux');
                assert.equal(fetchMock.calls().matched.length, 1);
            });
        });

        it('can replace query parameters', () => {
            requests.withQueryParameter('a', 'b');
            requests.setQueryParameters({foo: 'bar', baz: 'qux'});

            return requests.post('options').then(response => {
                assert.equal(response.url, 'http://google.com/options?foo=bar&baz=qux');
                assert.equal(fetchMock.calls().matched.length, 1);
            });
        });

        it('can specify array query parameters', () => {
            requests.setQueryParameters({foo: ['bar', 'baz']});

            return requests.post('options').then(response => {
                assert.equal(response.url, 'http://google.com/options?foo[]=bar&foo[]=baz');
                assert.equal(fetchMock.calls().matched.length, 1);
            });
        });
    });

    describe('#fetch', () => {
        it('can make raw fetch request', () => {
            var body = {
                method: 'POST',
                body: {foo: 'bar'}
            };

            return requests.fetch('options', body).then(parseJson).then(response => {
                assert.equal(response.data.options.headers, undefined);
            });
        });
    });

    describe('#put', () => {
        it('can make POST requests', () => {
            return requests.post('options', JSON.stringify({foo: 'bar'})).then(response => {
                assert.equal(response.data.options.method, 'POST');
                assert.equal(response.data.options.body, '{"foo":"bar"}');
            });
        });

        it('can make PATCH requests', () => {
            return requests.patch('options', JSON.stringify({foo: 'bar'})).then(response => {
                assert.equal(response.data.options.method, 'PATCH');
                assert.equal(response.data.options.body, '{"foo":"bar"}');
            });
        });

        it('can make PUT requests', () => {
            return requests.put('options', JSON.stringify({foo: 'bar'})).then(response => {
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

    describe('#setOptions', () => {
        it('can replace options', () => {
            return requests
                .setOptions({headers: {Foo: 'Bar'}})
                .make('options', {headers: {Bar: 'Baz'}})
                .then(response => {
                    assert.equal(response.data.options.headers.Foo, 'Bar');
                    assert.equal(response.data.options.headers.Bar, 'Baz');
                });
        });
    });

    describe('#withOptions', () => {
        it('can add options', () => {
            return requests
                .withBearerToken('Foo')
                .make('options')
                .then(response => {
                    assert.equal(response.data.options.method, 'GET');
                    assert.equal(response.data.options.headers.Authorization, 'Bearer Foo');
                });
        });

        it('can use callables as options', () => {
            return requests
                .withOptions({
                    headers: {
                        foo: options => options.baz,
                        baz: 'qux',
                    },
                })
                .withBearerToken(options => options.baz)
                .make('options')
                .then(response => {
                    assert.equal(response.data.options.method, 'GET');
                    assert.equal(response.data.options.headers.foo, 'qux');
                    assert.equal(response.data.options.headers.Authorization, 'Bearer qux');
                });
        });

        it('can have partial rootUrls', () => {
            requests.rootUrl = '/api';

            return requests
                .make('options')
                .then(response => {
                    assert.equal(response.data.options.method, 'GET');
                    assert.equal(response.data.url, '/api/options');
                });
        });

        it('can have absolute rootUrls with extra pathnames', () => {
            requests.rootUrl = 'http://google.com/foo/bar';

            return requests
                .make('options')
                .then(response => {
                    assert.equal(response.data.options.method, 'GET');
                    assert.equal(response.data.url, 'http://google.com/foo/bar/options');
                });
        });

        it('can route to subrequest', () => {
            requests.resource = 'users';

            return requests.getSubrequest(new DummySubrequest(), 1).show(1).then(response => response.json()).then(response => {
                assert.equal(response.name, 'article');
            });
        });

        it('can route to aliased subrequest', () => {
            requests.resource = 'users';
            requests.subrequests = {
                dummy: new DummySubrequest(),
            };

            return requests.getSubrequest('dummy', 1).show(1).then(response => response.json()).then(response => {
                assert.equal(response.name, 'article');
            });
        });

        it('can throw error on undefined subrequest', () => {
            try {
                requests.getSubrequest('foobar', 1);
            } catch (error) {
                assert.equal(error.message, 'No subrequest named foobar defined');
            }
        });
    });
});
