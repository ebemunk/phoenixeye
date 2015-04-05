'use strict';

describe('Filter: bytes', function () {
	beforeEach(module('phoenixeye'));

	var bytes;
	beforeEach(inject(function ($filter) {
		bytes = $filter('bytes');
	}));

	it('should return nothing when there is no filesize', function () {
		expect(bytes('text')).to.equal('-');
	});

	it('should return 0 bytes if bytes is 0', function () {
		expect(bytes(0)).to.equal('0 bytes');
	});

	it('should round the filesize based on the configured precision', function () {
		var size = 1024 + 512;
		expect(bytes(size)).to.equal('1.5 kB');
		expect(bytes(size, 2)).to.equal('1.50 kB');
	});

	it('should recognize bytes', function () {
		expect(bytes(1, 0)).to.equal('1 bytes');
	});

	it('should recognize KiloBytes', function () {
		expect(bytes(Math.pow(1024, 1), 0)).to.equal('1 kB');
	});

	it('should recognize MegaBytes', function () {
		expect(bytes(Math.pow(1024, 2), 0)).to.equal('1 MB');
	});

	it('should recognize GigaBytes', function () {
		expect(bytes(Math.pow(1024, 3), 0)).to.equal('1 GB');
	});

	it('should recognize TeraBytes', function () {
		expect(bytes(Math.pow(1024, 4), 0)).to.equal('1 TB');
	});

	it('should recognize PetaBytes', function () {
		expect(bytes(Math.pow(1024, 5), 0)).to.equal('1 PB');
	});
});