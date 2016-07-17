import service from './gps.service'
angular.module('GPSService', []).service('GPSService', service)

describe('GPSService', () => {
	let gpsService

	beforeEach(angular.mock.module('GPSService'))
	beforeEach(angular.mock.inject(GPSService => {
		gpsService = GPSService
	}))

	describe('getCoords', () => {
		it('should return false if unsuitable params', () => {
			const result = gpsService.getCoords({})
			expect(result).to.be.false
		})

		it('should convert GPS strings to lat/lng and return {lat, lng}', () => {
			const gpsInfo = {
				GPSVersionID: '0.0.2.2',
				GPSLatitudeRef: 'South',
				GPSLatitude: '33deg 51\' 21.910" ',
				GPSLongitudeRef: 'East',
				GPSLongitude: '151deg 13\' 11.730" ',
				GPSAltitudeRef: 'Above sea level',
				GPSAltitude: '0 m'
			}
			const result = gpsService.getCoords(gpsInfo)
			expect(result).to.deep.equal({
				lat: -33.85608611111111,
				lng: 151.219925
			})
		})
	})
})
