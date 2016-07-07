import debug from 'debug'

const log = debug('cli:components:colorspace')

let DI

export default class ColorspaceController {
	static $inject = [
		'$scope',
	]

	constructor() {
		DI = _.zipObject(ColorspaceController.$inject, [...arguments])
	}
}
