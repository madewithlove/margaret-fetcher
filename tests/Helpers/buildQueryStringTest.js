import assert from 'assert';
import {buildQueryString} from '../../src/Helpers';

describe('buildQueryString', () => {
    it('can build a query string', () => {
        const result = buildQueryString({
            foo: 'bar',
            baz: ['a', 'b'],
            qux: undefined,
            rob: [],
        });

        assert.equal(result, '?baz[]=a&baz[]=b&foo=bar');
    });
});
