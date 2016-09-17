import assert from 'assert';
import {buildQuery} from '../../src/Helpers';

describe('buildQuery', () => {
    it('can build a query', () => {
        const result = buildQuery({
            protocol: 'http',
            host: 'foo.com',
            pathname: 'foobar',
            query: {
                foo: 'bar',
                baz: ['a', 'b'],
                qux: undefined,
                rob: [],
            }
        });

        assert.equal(result, 'http://foo.com/foobar?foo=bar&baz[]=a&baz[]=b&');
    });
});
