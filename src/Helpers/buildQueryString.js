import mapKeys from 'lodash/mapKeys';
import {stringify} from 'query-string';

export default function buildQueryString(parameters) {
    // Switch keys to [] notation
    let query = mapKeys(parameters, (value, key) => {
        return Array.isArray(value) ? `${key}[]` : key;
    });

    // Stringify query parameters
    query = stringify(query, {encode: false});
    query = query ? `?${query}` : '';

    return query;
}
