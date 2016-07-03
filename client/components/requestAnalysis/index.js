import _ from 'lodash'
import debug from 'debug'

const log = debug('cli:modules:image:controller')

let DI

export default class RequestAnalysisController {
	static $inject = [
		'$http',
		'$state',
		'$rootScope',
		'$scope',
	]

	constructor() {
		DI = _.zipObject(RequestAnalysisController.$inject, [...arguments])
		this.analysis = {}
		this.ela = {
			quality: 70
		}
		this.copymove = {
			retain: 4,
			qcoeff: 1
		}
		this.hsv = {
			whitebg: false
		}
		this.labfast = {
			whitebg: false
		}
		DI.$rootScope.$on('$stateChangeSuccess', ::this.cancel)
	}

	ok() {
		if( this.analysis.ela && this.elaQuality ) {
			this.analysis.ela = {
				quality: this.elaQuality
			}
		}
		if( this.analysis.copymove && (this.copymove.retain || this.copymove.qcoeff) ) {
			this.analysis.copymove = {}

			if( this.copymoveRetain ) {
				this.analysis.copymove.retain = this.copymoveRetain
			}

			if( this.copymoveQcoeff ) {
				this.analysis.copymove.qcoeff = this.copymoveQcoeff
			}
		}
		if( this.hsvWhitebg ) {
			this.analysis.hsv = {
				whitebg: true
			}
		}
		if( this.labfastWhitebg ) {
			this.analysis.labfast = {
				whitebg: true
			}
		}
		if( ! this.isRequestEmpty() ) {
			const requestPromise = DI.$http({
				method: 'post',
				url: 'api/images/' + DI.$state.params.permalink + '/analysis',
				data: this.analysis
			})
			// DI.$modalInstance.close(requestPromise)
			DI.$scope.$close(requestPromise)
		}
	}

	cancel() {
		// DI.$modalInstance.dismiss('cancel')
		DI.$scope.$dismiss('cancel')
	}

	isRequestEmpty() {
		const atLeastOne = Object.keys(this.analysis).some(key => {
			return this.analysis[key]
		})
		return ! atLeastOne
	}
}
