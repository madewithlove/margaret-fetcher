import assert from 'assert';
import {buildOptions} from '../../src/Helpers';

describe('buildOptions', () => {
    it('can unwrap callable options', () => {
        const results = buildOptions({
            foo: 'foo',
            bar: options => options.foo,
            baz: () => 'baz',
        });

        expect(results).toEqual({
            foo: 'foo',
            bar: 'foo',
            baz: 'baz',
        });
    });
});
