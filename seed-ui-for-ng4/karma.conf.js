// Karma configuration file, see link for more information
// https://karma-runner.github.io/0.13/config/configuration-file.html

module.exports = function (config) {
   config.set({
      basePath: '',

      // List of test frameworks you want to use
      frameworks: ['jasmine', '@angular/cli'],

      // List of plugins to load
      plugins: [
         require('karma-jasmine'),
         require('karma-phantomjs-launcher'),
         require('karma-jasmine-html-reporter'),
         require('karma-coverage-istanbul-reporter'),
         require('@angular/cli/plugins/karma')
      ],

      // List of files/patterns to load in the browser
      files: [
         { pattern: './src/test.ts', watched: false }
      ],

      // A map of preprocessors to use. Preprocessors can be loaded through plugins.
      preprocessors: {
         './src/test.ts': ['@angular/cli']
      },

      // Redefine default mapping from file extensions to MIME-type
      mime: {
         'text/x-typescript': ['ts', 'tsx']
      },

      angularCli: {
         environment: 'dev'
      },

      // A list of reporters to use
      reporters: config.angularCli && config.angularCli.codeCoverage
            ? ['progress', 'coverage-istanbul']
            : ['progress', 'kjhtml'],

      // Any of these options are valid: https://github.com/istanbuljs/istanbul-api/blob/47b7803fbf7ca2fb4e4a15f3813a8884891ba272/lib/config.js#L33-L38
      coverageIstanbulReporter: {
         // List of reporters and options
         reports: [ 'html', 'lcovonly' ],
         // Base output directory
         dir: './target/coverage',
         // If using webpack and pre-loaders, work around webpack breaking the source path
         fixWebpackSourcePaths: true
      },      

      port: 9876,
      colors: true,
      autoWatch: true,
      browsers: ['PhantomJS'], // Chrome, PhantomJS
      singleRun: true,

      logLevel: config.LOG_INFO,
      client: {
         // leave Jasmine Spec Runner output visible in browser    
         captureConsole: false
      },

      // Define custom browsers
      customLaunchers: {
         'PhantomJS_debug': {
            base: 'PhantomJS',
            debug: true
         }
      },

      // How long will Karma wait for a message from a browser before disconnecting from it (in ms).
      // browserNoActivityTimeout: 100000,
      // The number of disconnections tolerated.
      // browserDisconnectTolerance: 2
   });
};
