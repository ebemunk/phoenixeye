var config = require('./config.json');
var monq = require('monq');
var client = monq(config.dbString);
var worker = client.worker(['example']);

// worker.register({
//     reverse: function (params, callback) {
//         try {
//             var reversed = params.text.split('').reverse().join('');
//             callback(null, reversed);
//         } catch (err) {
//             callback(err);
//         }
//     }
// });

worker.start();