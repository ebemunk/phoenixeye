/*global angular*/

angular.module('phoenixeye')
.service('ImageService', ImageService);

ImageService.$inject = [
	'debug',
	'$http'
];

function ImageService (debug, $http) {
	debug = debug('app:ImageService');

	this.getAnalyses = getAnalyses;

	function getAnalyses (imageId) {
		return $http({
			method: 'get',
			url: 'api/analyses/' + imageId
		})
		.then(function (response) {
			debug('getAnalyses', response);

			var analyses = {
				ela: [],
				lg: [],
				avgdist: [],
				copymove: []
			};

			var histograms = {
				hsv: [],
				lab_fast: []
			};

			response.data.forEach(function (analysis) {
				if( analysis.type == 'hsv' || analysis.type == 'lab_fast' ) {
					histograms[analysis.type].push(analysis);
				} else {
					analyses[analysis.type].push(analysis);
				}
			});

			var type;

			//sort by most recent created date
			for( type in analyses ) {
				analyses[type] = analyses[type].sort(mostRecentCreatedAt);
			}

			//sort by most recent created date
			for( type in histograms ) {
				histograms[type] = histograms[type].sort(mostRecentCreatedAt);
			}

			return [analyses, histograms];

			function mostRecentCreatedAt (a, b) {
				return a.createdAt < b.createdAt;
			}
		});
	}
}