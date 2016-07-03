import {AppConfig} from './app.config'
import {PromiseConfig, PromiseScheduler} from './promise.config'

export default {
	config: {
		AppConfig,
		PromiseConfig
	},
	run: {
		PromiseScheduler
	}
}
