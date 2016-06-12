import assert from 'assert';
import fetchMock from 'fetch-mock';
import CrudRequest from '../src/CrudRequest';
import 'babel-polyfill';

describe('CrudRequest', () => {
    let requests;

    fetchMock.mock('http://google.com/users', 'GET', {users: ['foo']});
    fetchMock.mock('http://google.com/users/1', 'GET', {name: 'foo'});
    fetchMock.mock('http://google.com/users/1', 'DELETE', 204);
    fetchMock.mock('http://google.com/users', 'POST', (url, options) => {
        return {users: [JSON.parse(options.body)]};
    });
    fetchMock.mock('http://google.com/users/1', 'PUT', (url, options) => {
        return JSON.parse(options.body);
    });

    beforeEach(() => {
        requests = new CrudRequest();
        requests.rootUrl = 'http://google.com';
        requests.resource = 'users';
        fetchMock.reset();
    });

    describe('#index', () => {
        it('can get all of a resource', () => {
            return requests.index().then(response => {
                assert.deepEqual(response.data.users, ['foo']);
                assert.equal(fetchMock.calls().matched.length, 1);
            });
        });
    });

    describe('#store', () => {
        it('can store a resource', () => {
            return requests.store({name: 'foo'}).then(response => {
                assert.deepEqual(response.data.users, [{name: 'foo'}]);
                assert.equal(fetchMock.calls().matched.length, 1);
            });
        });
    });

    describe('#show', () => {
        it('can get a resource', () => {
            return requests.show(1).then(response => {
                assert.deepEqual(response.data, {name: 'foo'});
                assert.equal(fetchMock.calls().matched.length, 1);
            });
        });
    });

    describe('#update', () => {
        it('can update a resource', () => {
            return requests.update(1, {name: 'bar'}).then(response => {
                assert.deepEqual(response.data, {name: 'bar'});
                assert.equal(fetchMock.calls().matched.length, 1);
            });
        });
    });

    describe('#delete', () => {
        it('can delete a resource', () => {
            return requests.destroy(1).then(response => {
                assert.equal(response.status, 204);
            });
        });
    });
});
