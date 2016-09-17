import fetchMock from 'fetch-mock';
import {parseJson, extractData} from '../../src/Middlewares';

describe('extractData', () => {
    fetchMock.reset();
    fetchMock.mock('http://google.com/foo', {data: {foo: "bar"}});
    fetchMock.mock('http://google.com/nodata', {foo: "bar"});

    it('can extract data from response', () => {
        return fetch('http://google.com/foo')
            .then(parseJson)
            .then(extractData)
            .then(extracted => {
                expect(extracted).toEqual({foo: 'bar'});
            });
    });

    it('can fallback to returning all response if not', () => {
        return fetch('http://google.com/nodata')
            .then(parseJson)
            .then(extractData)
            .then(extracted => {
                expect(extracted).toEqual({foo: 'bar'});
            });
    });
});
