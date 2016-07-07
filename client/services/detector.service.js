import debug from 'debug'

const log = debug('cli:services:detector')

let DI

export default class DetectorService {
	static $inject = [
		'$window',
		'$document'
	]

	constructor() {
		DI = _.zipObject(DetectorService.$inject, [...arguments])
		this.canvas = !! DI.$window.CanvasRenderingContext2D
		this.workers = !! DI.$window.Worker
		this.webgl = this.detectWebGL()
	}

	detectWebGL() {
		try {
			var canvas = DO.$document[0].createElement('canvas');
			return !! DO.$window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
		} catch (e) {
			return false;
		}
	}
}
