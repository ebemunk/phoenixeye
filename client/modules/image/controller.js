import _ from 'lodash'
import debug from 'debug'

//modal
import RequestAnalysisController from '../../components/requestAnalysis'
import RequestAnalysisTemplate from '../../components/requestAnalysis/index.html'

const log = debug('cli:modules:image:controller')

let DI

class ImageController {
	static $inject = [
		'$scope',
		'$state',
		'localStorageService',
		'PollService',
		'ImageService',
		'ngToast',
		'$http',
		'$timeout',
		'$uibModal',
		'GPSService'
	]

	constructor() {
		DI = _.zipObject(ImageController.$inject, [...arguments])
		//set state
		_.assign(this, {
			image: DI.$state.params.image,
			displayedImage: DI.$state.params.image,
			displayFitToWidth: true,
			analyses: {
				ela: [],
				lg: [],
				avgdist: [],
				copymove: []
			},
			histograms: {
				hsv: [],
				lab_fast: []
			},
			displayedHSV: null,
			displayedLab: null,
			collapsedPanels: DI.localStorageService.get('collapsedPanels') || {}
		})
		//init
		this.init()
		//watchers
		DI.$scope.$watch('vm.collapsedPanels', ::this.collapsedPanelsWatch, true)
	}

	async init() {
		try {
			//load image if not already loaded
			if( ! this.image ) {
				const resp = await DI.$http({
					method: 'GET',
					url: `api/images/${DI.$state.params.permalink}`
				})
				this.image = resp.data
				this.displayedImage = this.image
				if( ! DI.$scope.$$phase ) DI.$scope.$apply()
			}
			//poll for job if it exists
			if( DI.$state.params.jobId ) pollJob(DI.$state.params.jobId)
			//poll until image processing is done
			const resp = await DI.PollService.pollUntil(
				{
					method: 'GET',
					url: `api/images/${DI.$state.params.permalink}`
				},
				result => _.get(result, 'data.metaComplete', false)
			)
			//assign results after processing is finished
			this.image = resp.data
			this.displayedImage = this.image
			//build meta list
			this.metaList = {}
			if( this.image.exif ) {
				this.metaList.exif = this.image.exif
				if( this.image.exif.GPSInfo ) {
					this.gps = DI.GPSService.getCoords(this.image.exif.GPSInfo)
				}
			}
			if( this.image.iptc ) this.metaList.iptc = this.image.iptc
			if( this.image.xmp ) this.metaList.xmp = this.image.xmp
			this.getAnalyses(this.image.id)
		} catch (err) {
			log('error while polling api/images/imageId', err)
			let errString
			if( err.status === 404 ) {
				errString = 'This image does not exist.'
			} else {
				errString = `Something went wrong :(<br><strong>${err.statusText}</strong>`
			}
			DI.ngToast.danger(errString)
			DI.$state.go('404')
		} finally {
			if( ! DI.$scope.$$phase ) DI.$scope.$apply()
		}
	}

	pollJob(jobId) {
		this.analysisPollActive = true
		return DI.PollService.pollUntil({
			method: 'get',
			url: 'api/jobs/' + jobId
		}, response => {
			const status = _.get(response, 'data.status')
			return status === 'complete' || status === 'failed'
		})
		.then(response => {
			this.analysisPollActive = false
			DI.ngToast.success('Analyses are ready!')
			return getAnalyses(this.image.id)
		})
	}

	getAnalyses(imageId) {
		return DI.ImageService.getAnalyses(imageId)
		.then(resp => {
			const [analyses, histograms] = resp
			log('analyses', analyses, histograms)
			this.analyses = analyses
			this.histograms = histograms
			this.displayedHSV = histograms.hsv[0]
			this.displayedLab = histograms.lab_fast[0]
			//get qtables for jpg after analysis complete
			if( this.image.type == 'jpg' && Object.keys(this.image.qtables).length === 0 ) {
				DI.$http({
					method: 'get',
					url: 'api/images/' + $state.params.permalink
				})
				.then(response => {
					this.image = response.data.image
				})
			}
		})
		.catch((response, status) => {
			log('error analyses', response, status)
			DI.ngToast.danger('Something went wrong :(<br><strong>' + response.data.error + '</strong>')
		})
	}

	collapsedPanelsWatch(collapsedPanels) {
		if( ! collapsedPanels ) return
		if( ! collapsedPanels.map ) {
			DI.$timeout(function () {
				DI.$scope.$broadcast('gpsMapInit')
			}, 1500)
		}
		DI.localStorageService.set('collapsedPanels', collapsedPanels)
	}

	requestAnalysis() {
		const modal = DI.$uibModal.open({
			animation: true,
			template: RequestAnalysisTemplate,
			controller: RequestAnalysisController,
			controllerAs: 'vm',
			backdrop: 'static'
		})
		modal.result
		.then((response) => {
			log('modal response', response)
			DI.ngToast.success('Analysis request submitted.')
			this.pollJob(response.data.jobId)
		})
		.catch(function (err) {
			log('modal fail', err)
		})
	}
}

export default ImageController
