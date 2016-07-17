import filter from './bytes.filter'
angular.module('bytesFilter', []).filter('bytes', filter)

describe('bytesFilter', () => {
	let bytesFilter

	beforeEach(angular.mock.module('bytesFilter'))
	beforeEach(angular.mock.inject($filter => {
		bytesFilter = $filter('bytes')
	}))

	it('should return nothing when there is no filesize', () => {
		expect(bytesFilter('text')).to.equal('-')
	})

	it('should return 0 bytes if bytes is 0', () => {
		expect(bytesFilter(0)).to.equal('0 bytes')
	})

	it('should round the filesize based on the configured precision', () => {
		var size = 1024 + 512
		expect(bytesFilter(size)).to.equal('1.5 kB')
		expect(bytesFilter(size, 2)).to.equal('1.50 kB')
	})

	it('should recognize bytes', () => {
		expect(bytesFilter(1, 0)).to.equal('1 bytes')
	})

	it('should recognize KiloBytes', () => {
	expect(	bytesFilter(Math.pow(1024, 1), 0)).to.equal('1 kB')
	})

	it('should recognize MegaBytes', () => {
		expect(bytesFilter(Math.pow(1024, 2), 0)).to.equal('1 MB')
	})

	it('should recognize GigaBytes', () => {
		expect(bytesFilter(Math.pow(1024, 3), 0)).to.equal('1 GB')
	})

	it('should recognize TeraBytes', () => {
		expect(bytesFilter(Math.pow(1024, 4), 0)).to.equal('1 TB')
	})

	it('should recognize PetaBytes', () => {
		expect(bytesFilter(Math.pow(1024, 5), 0)).to.equal('1 PB')
	})
})
