import url from 'url';
import omitBy from 'lodash/omitBy';
import mapKeys from 'lodash/mapKeys';

export default function buildQuery(components) {
    // Switch keys to [] notation
    components.query = mapKeys(components.query, (value, key) => {
        return Array.isArray(value) ? `${key}[]` : key;
    });

    // Remove dead query string parameters
    components.query = omitBy(components.query, value => {
        return typeof value === 'undefined';
    });

    // Decode URI components (for includes and arrays)
    let built = url.format(components);
    built = decodeURI(built);

    return built;
}
