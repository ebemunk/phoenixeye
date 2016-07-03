import debug from 'debug'
import Waterline from 'waterline'

//eslint-disable-next-line no-unused-vars
const log = debug('Analysis')

let Analysis = {
	identity: 'analysis',
	tableName: 'analyses',
	connection: 'default',
	migrate: 'safe',

	attributes: {
		//data
		type: 'string',
		s3key: 'string',
		params: 'json',
		url: 'string',

		image: {
			model: 'image'
		}
	},

	// afterDestroy: function (deleted, next) {
	// 	debug('Analysis.afterDestroy')
	//
	// 	return Promise.map(deleted, function (analysis) {
	// 		return Promise.fromNode(function (callback) {
	// 			return fs.unlink(path.join(analysis.path, analysis.fileName), callback)
	// 		})
	// 	})
	// 	.finally(function () {
	// 		next()
	// 	})
	// }
}

export default Waterline.Collection.extend(Analysis)
