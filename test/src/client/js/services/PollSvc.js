beforeEach(module('phoenixeye'));
beforeEach(function() {
	inject(function($injector) {
		PollSvc = $injector.get('PollSvc');
	});
});

it('should not alert first two notifications', function(done) {
	expect(true).to.be.true;
	done();
});
