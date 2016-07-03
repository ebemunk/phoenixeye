import _ from 'lodash'
import Promise from 'bluebird'
import debug from 'debug'

const log = debug('cli:services:image')

let DI

export default class PollService {
	static $inject = [
		'$http',
	]

	constructor() {
		DI = _.zipObject(PollService.$inject, [...arguments])
	}

	getAnalyses(imageId) {
		return DI.$http({
			method: 'get',
			url: 'api/analyses/' + imageId
		})
		.then(response => {
			log('getAnalyses', response)
			var analyses = {
				ela: [],
				lg: [],
				avgdist: [],
				copymove: []
			}
			var histograms = {
				hsv: [],
				lab_fast: []
			}
			response.data.forEach(analysis => {
				if( analysis.type == 'hsv' || analysis.type == 'lab_fast' ) {
					histograms[analysis.type].push(analysis)
				} else {
					analyses[analysis.type].push(analysis)
				}
			})
			var type
			//sort by most recent created date
			for( type in analyses ) {
				analyses[type] = analyses[type].sort(mostRecentCreatedAt)
			}
			//sort by most recent created date
			for( type in histograms ) {
				histograms[type] = histograms[type].sort(mostRecentCreatedAt)
			}
			return [analyses, histograms]
			function mostRecentCreatedAt(a, b) {
				return a.createdAt < b.createdAt
			}
		})
	}
}
