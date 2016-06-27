import {expect} from 'chai'

import appConfig from '../appConfig'
import {handleJob, __RewireAPI__} from './WorkerUtil'

describe('WorkerUtil', () => {
	describe('getJobCmd', () => {
		it('should construct cmd with correct params', () => {
			let getJobCmd = __RewireAPI__.__GetDependency__('getJobCmd')
			let cmd = getJobCmd(appConfig.defaultAnalysisOpts, 'mypath/myname')
			let strings = [
				'-f mypath/myname',
				'-o mypath',
				'-json',
				`-ela ${appConfig.defaultAnalysisOpts.ela.quality}`,
				'-avgdist',
				'-lg',
				'-hsv',
				'-labfast',
				`-copymove ${appConfig.defaultAnalysisOpts.copymove.retain} ${appConfig.defaultAnalysisOpts.copymove.qcoeff}`
			].forEach(string => expect(cmd).to.contain(string))
			expect(cmd).to.not.contain('-autolevels')
		})
	})
})
