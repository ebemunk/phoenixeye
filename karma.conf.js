// Karma configuration
// Generated on Sun Mar 29 2015 10:00:42 GMT-0700 (Pacific Daylight Time)

module.exports = function(config) {
	var configuration = {

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '',

		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['mocha', 'chai', 'sinon'],

		// list of files / patterns to load in the browser
		files: [
			'client/vendor/stats.js',
			'client/dist/dependencies.js',
			'client/dist/debug.js',
			'client/dist/templates.js',
			'client/phoenixeye.module.js',
			'client/!(dist)/**/*.js',
			'bower_components/angular-mocks/angular-mocks.js',
			'test/src/client/**/*.js'
		],

		// list of files to exclude
		exclude: [
		],

		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			'client/!(dist|vendor)/**/*.js': ['coverage']
		},

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['mocha', 'coverage'],

		coverageReporter: {
			type : 'lcov',
			dir : 'test/coverage/client'
		},

		// web server port
		port: 9876,

		// enable / disable colors in the output (reporters and logs)
		colors: true,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,

		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		// browsers: ['Chrome', 'Firefox', 'IE'],
		browsers: ['Firefox'],

		// customLaunchers: {
		//   Chrome_travis_ci: {
		//     base: 'Chrome',
		//     flags: ['--no-sandbox']
		//   }
		// },

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: true
	};

	// if(process.env.TRAVIS){
	//   configuration.browsers = ['Chrome_travis_ci'];
	// }

	config.set(configuration);
};
