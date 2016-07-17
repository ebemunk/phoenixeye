var webpackConfig = require('./webpack/webpack.client.config')

module.exports = config => {
	var conf = {
		basePath: '',

		frameworks: ['angular', 'mocha', 'chai', 'sinon'],

		angular: ['mocks'],

		files: [
			'client/**/*.test.js',
			// 'client/services/*.test.js'
			// 'client/services/image.service.test.js'
		],

		exclude: [

		],

		preprocessors: {
			'client/**/*.test.js': ['webpack', 'sourcemap']
		},

		reporters: ['mocha', 'coverage'],

		coverageReporter: {
			type: 'lcov',
			dir: 'coverage/client',
			includeAllSources: true
		},

		port: 9876,

		colors: true,

		logLevel: config.LOG_INFO,

		// autoWatch: false,

		browsers: ['Firefox'],

		// singleRun: true

		webpack: {
			module: {
				loaders: [
					{
						loader: 'babel-loader',
						test: /\.js$/,
						exclude: /node_modules/
					}
				]
			},
			devtool: 'inline-source-map',
			target: 'web',
		},
		webpackMiddleware: {
			noInfo: true
		}
	}

	config.set(conf)
}
