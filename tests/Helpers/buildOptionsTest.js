import assert from 'assert';
import url from 'url';
import {buildOptions} from '../../src/Helpers';

describe('buildOptions', () => {
    it('can unwrap callable options', () => {
        const results = buildOptions({
            foo: 'foo',
            bar: options => options.foo,
            baz: () => 'baz',
        });

        assert.deepEqual(results, {
            foo: 'foo',
            bar: 'foo',
            baz: 'baz',
        });
    });
});
