/*global angular*/

angular.module('phoenixeye')
.service('DetectorService', DetectorService);

DetectorService.$inject = [
	'$window',
	'$document'
];

function DetectorService ($window, $document) {
	this.canvas = !! $window.CanvasRenderingContext2D;
	this.workers = !! $window.Worker;
	this.webgl = detectWebGL();

	function detectWebGL () {
		try {
			var canvas = $document[0].createElement('canvas');
			return !! $window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
		} catch (e) {
			return false;
		}
	}
}