var PollSvc;

beforeEach(module('phoenixeye'));

beforeEach(inject(function(_PollSvc_) {
	PollSvc = _PollSvc_;
}));

it('yes', function(done) {
	// PollSvg.pollUntil({}, function (te) {return true;});
	expect(true).to.be.true;
	done();
});