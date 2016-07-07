import _ from 'lodash'
import debug from 'debug'

import {imagePolicy} from '../../components'

const log = debug('cli:modules:home:controller')

let DI

class HomeController {
	static $inject = [
		'$http',
		'$rootScope',
		'$state',
		'Upload',
		'ngToast',
		'localStorageService',
		'$uibModal'
	]

	constructor() {
		DI = _.zipObject(HomeController.$inject, [...arguments])
	}

	async confirmSubmissionPolicy() {
		if( DI.localStorageService.get('acceptedSubmissionPolicy') ) return true
		const modalScope = DI.$rootScope.$new()
		modalScope.ok = () => modal.close(true)
		const modal = DI.$uibModal.open({
			animation: true,
			template: imagePolicy,
			scope: modalScope,
			backdrop: 'static',
			keyboard: false
		})

		const resp = await modal.result
		if( ! resp ) throw new Error('You must accept the upload policy to submit images for analysis.')
		DI.localStorageService.set('acceptedSubmissionPolicy', true)
	}

	async upload(filesOrUrl, type) {
		try {
			await this.confirmSubmissionPolicy()
			if( ! filesOrUrl || ! filesOrUrl.length ) return
			let resp
			if( type === 'file' ) {
				resp = await Promise.resolve(DI.Upload.upload({
					url: '/api/images/upload',
					file: filesOrUrl[0] //first file
				}))
			} else {
				resp = await DI.$http({
					method: 'POST',
					url: 'api/images/submit',
					data: {url: filesOrUrl} //url
				})
			}
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
			DI.ngToast.danger('Something went wrong :(<br><strong>' + err.message + '</strong>');
		} finally {
			//tears
			if( ! DI.$rootScope.$$phase ) DI.$rootScope.$apply()
		}
	}
}

export default HomeController
