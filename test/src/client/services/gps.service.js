/*eslint-env node, mocha*/
/*global inject*/

'use strict';

describe('Service: GPSService', function () {
	var GPSService;

	beforeEach(module('phoenixeye'));

	beforeEach(module(function ($urlRouterProvider) {
		$urlRouterProvider.deferIntercept();
	}));

	beforeEach(inject(function ($injector) {
		GPSService = $injector.get('GPSService');
	}));

	describe('prototype.getCoords', function () {
		it('should return false if unsuitable params', function () {
			var result = GPSService.getCoords({});

			result.should.be.false;
		});

		it('should convert GPS strings to lat/lng and return {lat, lng}', function () {
			var gpsInfo = {
				GPSVersionID: '0.0.2.2',
				GPSLatitudeRef: 'South',
				GPSLatitude: '33deg 51\' 21.910" ',
				GPSLongitudeRef: 'East',
				GPSLongitude: '151deg 13\' 11.730" ',
				GPSAltitudeRef: 'Above sea level',
				GPSAltitude: '0 m'
			};

			var result = GPSService.getCoords(gpsInfo);

			result.should.have.property('lat');
			result.should.have.property('lng');

			result.lat.should.be.equal(-33.85608611111111);
			result.lng.should.be.equal(151.219925);
		});
	});
});