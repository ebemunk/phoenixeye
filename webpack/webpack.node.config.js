const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')

const config = {
	entry: {
		server: ['babel-polyfill', './server/index.js'],
		worker: ['babel-polyfill', './worker/index.js']
	},
	output: {
		path: './dist',
		filename: '[name].js'
	},
	target: 'node',
	externals: [nodeExternals()],
	module: {
		loaders: [
			{
				loader: 'babel-loader',
				test: /\.js$/,
				exclude: /node_modules/
			},
			{
				loader: 'json',
				test: /\.json$/
			}
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`
		})
	]
}

module.exports = config
