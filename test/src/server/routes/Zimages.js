// 	describe('/:permalink/analysis', function () {
// 		beforeEach(function (done) {
// 			Image.create({
// 				permalink: 'testPermalink'
// 			}, function (err, image) {
// 				done();
// 			});
// 		});

// 		it('should return error if permalink doesnt exist', function (done) {
// 			testServer
// 				.post('/api/images/wrong/analysis')
// 				.expect(400, done);
// 		});

// 		it('should return error if no valid params found', function (done) {
// 			testServer
// 				.post('/api/images/testPermalink/analysis')
// 				.send({wrong: 'nope', lolo: 'kekek'})
// 				.expect(400, done);			
// 		});

// 		it('should enqueue job if valid params', function (done) {
// 			testServer
// 				.post('/api/images/testPermalink/analysis')
// 				.send({ela: true, hsv: {whitebg: true}})
// 				.end(function (err, res) {
// 					expect(res.status).to.equal(200);
// 					expect(res.body).to.have.property('jobId');

// 					done();
// 				});
// 		});
// 	});