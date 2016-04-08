var config = require('madewithlove-webpack-config').packages;

module.exports = config({
    libraryName: 'MargaretFetcher',
}).merge({
    externals: {
        'isomorphic-fetch': true,
    },
});
