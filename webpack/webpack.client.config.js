const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const entries = ['babel-polyfill', __dirname + '/../client/index.js']

if( process.env.NODE_ENV !== 'production' ) {
	entries.unshift('webpack-hot-middleware/client')
}

const config = {
	entry: {
		client: entries
	},
	output: {
		path: __dirname + '/../dist',
		filename: 'bundle.[hash].js'
	},
	target: 'web',
	devtool: 'source-map',
	plugins: [
		new HtmlWebpackPlugin({
			template: './client/index.html'
		}),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoErrorsPlugin(),
	],
	module: {
		loaders: [
			{
				loader: 'babel-loader',
				test: /\.js$/,
				exclude: /node_modules/
			},
			{
				loader: 'raw-loader',
				test: /\.html$/,
				exclude: /client\/index.html$/
			},
			{
				test: /\.less$/,
				loaders: [
					'style-loader',
					'css-loader?sourceMap',
					'less-loader?sourceMap',
				]
			},
			{
				test: /\.css$/,
				loaders: [
					'style-loader',
					'css-loader'
				]
			},
			{
				test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
				loader: 'url?limit=10000&mimetype=application/font-woff'
			},
			{
				test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
				loader: 'url?limit=10000&mimetype=application/octet-stream'
			},
			{
				test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
				loader: 'file'
			},
			{
				test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
				loader: 'url?limit=10000&mimetype=image/svg+xml'
			},
			{
				test: /\.(png)$/,
				loader: 'url-loader'
			}
		]
	}
}

module.exports = config
