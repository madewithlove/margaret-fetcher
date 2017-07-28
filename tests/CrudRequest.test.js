import fetchMock from 'fetch-mock';
import CrudRequest from '../src/CrudRequest';

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
                expect(response.data.users).toEqual(['foo']);
                expect(fetchMock.calls().matched.length).toBe(1);
            });
        });
    });

    describe('#store', () => {
        it('can store a resource', () => {
            return requests.store({name: 'foo'}).then(response => {
                expect(response.data.users).toEqual([{name: 'foo'}]);
                expect(fetchMock.calls().matched.length).toEqual(1);
            });
        });
    });

    describe('#show', () => {
        it('can get a resource', () => {
            return requests.show(1).then(response => {
                expect(response.data).toEqual({name: 'foo'});
                expect(fetchMock.calls().matched.length).toEqual(1);
            });
        });
    });

    describe('#update', () => {
        it('can update a resource', () => {
            return requests.update(1, {name: 'bar'}).then(response => {
                expect(response.data).toEqual({name: 'bar'});
                expect(fetchMock.calls().matched.length).toEqual(1);
            });
        });
    });

    describe('#delete', () => {
        it('can delete a resource', () => {
            return requests.destroy(1).then(response => {
                expect(response.status).toEqual(204);
            });
        });
    });
});
