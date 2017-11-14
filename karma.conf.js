const webpackConfig = require('./webpack.config')

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-webpack'),
      require('karma-sourcemap-loader'),
      require('karma-jasmine-html-reporter')
    ],
    client:{
      clearContext: false
    },
    files: [
      { pattern: './src/test.ts', watched: false }
    ],
    preprocessors: {
      './src/test.ts': [ 'webpack', 'sourcemap' ]
    },
    mime: {
      'text/x-typescript': ['ts','tsx']
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      stats: webpackConfig.stats
    },
    reporters: ['progress', 'kjhtml'],
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false
  });
};
