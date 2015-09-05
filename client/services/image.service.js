angular.module('phoenixeye')
.service('ImageService', ImageService);

ImageService.$inject = [
	'$http',
	'debug'
];

ImageService.$name = 'ImageService';

function ImageService () {
	injectToThis(this.constructor).apply(this, arguments);
}

ImageService.prototype.getAnalyses = function (imageId) {
	var self = this;

	return self.$http({
		method: 'get',
		url: 'api/analyses/' + imageId
	})
	.then(function (response, status) {
		self.debug('getAnalyses', response);

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

		function mostRecentCreatedAt (a, b) {
			return a.createdAt < b.createdAt;
		}

		//sort by most recent created date
		for( var type in analyses ) {
			analyses[type] = analyses[type].sort(mostRecentCreatedAt);
		}

		//sort by most recent created date
		for( var type in histograms ) {
			histograms[type] = histograms[type].sort(mostRecentCreatedAt);
		}

		return [analyses, histograms];
	});
};