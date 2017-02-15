var webpackConfig = require('./webpack/webpack.test.js');

module.exports = function (config) {
  var _config = {
    basePath: '',

    frameworks: [ 'jasmine' ],

    files: [
      { pattern: './karma-test-shim.js' }
    ],

    preprocessors: {
      './karma-test-shim.js': [ 'coverage', 'webpack', 'sourcemap' ]
    },

    webpack: webpackConfig,

    webpackMiddleware: {
      stats: 'errors-only'
    },

    reporters: [ 'nyan', 'junit', 'coverage', 'remap-coverage' ],
    nyanReporter: {
      renderOnRunCompleteOnly: process.env.TOOMEAN_CI_IS_RUNNER || false,
      suppressErrorHighlighting: true
    },
    junitReporter: {
      outputDir: '../build/reports/client',
      outputFile: 'test-results.xml'
    },
    coverageReporter: {
      type: 'in-memory'
    },
    remapCoverageReporter: {
      cobertura: 'build/reports/client/coverage/cobertura.xml'
    },

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: [ 'PhantomJS' ],

    singleRun: true
  };

  config.set(_config);
};
