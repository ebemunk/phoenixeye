//rewire stuff we need here, globally, as multiple rewire calls error out
var rewire = require('rewire');

var serverPath = '../../../server/';
var Image = rewire(serverPath + 'models/image.js');

//stub out monq
var monqStub = Image.__set__({
	queue: {
		enqueue: function(a, b, c) {
			return c(null, {data:{params:b, _id:5}});
		}
	}
});