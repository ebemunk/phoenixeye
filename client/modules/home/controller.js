import debug from 'debug'

const log = debug('cli:modules:home:controller')

let DI

class HomeController {
	static $inject = [
		'$http',
		'$q',
		'$rootScope',
		'$state',
		'Upload',
		'ngToast',
		'localStorageService',
		'$modal'
	]

	constructor($http, $q, $rootScope, $state, Upload, ngToast, localStorageService) {
		DI = {
			$http, $q, $rootScope, $state, Upload, ngToast, localStorageService
		}
	}

	async confirmSubmissionPolicy() {
		if( DI.localStorageService.get('acceptedSubmissionPolicy') ) return true
		const modalScope = DI.$rootScope.$new()
		modalScope.ok = () => modal.close(true)
		const modal = DI.$modal.open({

		})
	}

	async upload(files) {
		try {
			if( ! files || ! files.length ) return
			const file = files[0]
			const resp = await Promise.resolve(DI.Upload.upload({
				url: '/api/images/upload',
				file: file
			}))
			log('upload', resp)
			const jobId = resp.data.jobId || null
			DI.ngToast.success('Upload complete!')
			DI.$state.go('image', {
				image: resp.data.image,
				jobId: jobId,
				permalink: resp.data.image.permalink
			})
		} catch (err) {
			log('err', err)
			DI.ngToast.danger('Something went wrong :(<br><strong>' + err + '</strong>');
		} finally {
			DI.$rootScope.$apply()
		}
	}
}

export default HomeController
