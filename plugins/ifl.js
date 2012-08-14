var util = require('util');
var exec = require('child_process').exec;

(function(exports){

	"use strict";

	// https://code.google.com/apis/console/b/0/#project:165593310056:stats:customsearch
	var api = ''; // add your api key

	exports.message = function(from, message, callback) {
		var command = 'curl "https://www.googleapis.com/customsearch/v1?';
		command += '&key='+ api +'&cx=013036536707430787589:_pqjad5hr1a';
		command += '&q='+ encodeURIComponent(message);
		command += '&alt=json"';
		var child = exec(command, function(err, stdout, stderr) {

			var json = JSON.parse(stdout);
			var first = json.items[0];
			var title = first.title;
			var link = first.link;
			var out = link +' ('+ title +')';

			callback(null, out);
		});
	};

})(this);
