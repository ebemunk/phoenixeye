/*global angular*/

angular.module('phoenixeye')
.service('GPSService', GPSService);

GPSService.$inject = [
	'debug'
];

function GPSService (debug) {
	debug = debug('app:GPSService');

	this.getCoords = getCoords;
	this.DMStoDD = DMStoDD;

	function getCoords (gpsInfo) {
		if( ! gpsInfo.GPSLatitude || ! gpsInfo.GPSLatitudeRef || ! gpsInfo.GPSLongitude || ! gpsInfo.GPSLongitudeRef ) {
			return false;
		}

		var lat = DMStoDD(gpsInfo.GPSLatitude, gpsInfo.GPSLatitudeRef);
		var lng = DMStoDD(gpsInfo.GPSLongitude, gpsInfo.GPSLongitudeRef);

		return {
			lat: lat,
			lng: lng
		};
	}

	function DMStoDD (gpsString, gpsDirection) {
		var parts = gpsString.split(' ');

		var deg = parseFloat(parts[0].replace('deg', '').replace('°', '')) || 0;
		var min = parseFloat(parts[1]) || 0;
		var sec = parseFloat(parts[2]) || 0;
		gpsDirection = gpsDirection || parts[3];

		debug('gps: deg, min, sec, direction', deg, min, sec, gpsDirection);

		var dd = deg + min/60 + sec/3600;

		if( gpsDirection ) {
			gpsDirection = gpsDirection[0].toLowerCase();
			if( gpsDirection == 's' || gpsDirection == 'w' ) {
				dd *= -1;
			}
		}

		debug('gps dd', dd);

		return dd;
	}
}