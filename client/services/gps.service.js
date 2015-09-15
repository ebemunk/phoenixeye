/*global angular, injectToThis*/

angular.module('phoenixeye')
.service('GPSService', GPSService);

GPSService.$inject = [
	'debug'
];

GPSService.$name = 'GPSService';

function GPSService () {
	injectToThis(this.constructor).apply(this, arguments);
}

GPSService.prototype.getCoords = function (gpsInfo) {
	var self = this;

	if( ! gpsInfo.GPSLatitude || ! gpsInfo.GPSLatitudeRef || ! gpsInfo.GPSLongitude || ! gpsInfo.GPSLongitudeRef ) {
		return false;
	}

	var lat = self.DMStoDD(gpsInfo.GPSLatitude, gpsInfo.GPSLatitudeRef);
	var lng = self.DMStoDD(gpsInfo.GPSLongitude, gpsInfo.GPSLongitudeRef);

	return {
		lat: lat,
		lng: lng
	};
};

GPSService.prototype.DMStoDD = function (gpsString, gpsDirection) {
	var self = this;

	var parts = gpsString.split(' ');

	var deg = parseFloat(parts[0].replace('deg', '').replace('°', '')) || 0;
	var min = parseFloat(parts[1]) || 0;
	var sec = parseFloat(parts[2]) || 0;
	gpsDirection = gpsDirection || parts[3];

	self.debug('gps: deg, min, sec, direction', deg, min, sec, gpsDirection);

	var dd = deg + min/60 + sec/3600;

	if( gpsDirection ) {
		gpsDirection = gpsDirection[0].toLowerCase();
		if( gpsDirection == 's' || gpsDirection == 'w' ) {
			dd *= -1;
		}
	}

	self.debug('gps dd', dd);

	return dd;
};