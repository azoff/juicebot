(function(exports){

	"use strict";
	
	var fs    = require('fs');
	var https = require('https');
	var conf  = fs.readFileSync('./conf/google.json');
	var opts  = JSON.parse(conf);

	exports.message = function(from, message, callback) {	
		var json = '';
		var request = https.get({
		    headers: { 'Content-Type': 'application/json' },
		    host: 'www.googleapis.com',
		    path: '/customsearch/v1?alt=json&cx=013036536707430787589:_pqjad5hr1a&key=' + 
				opts.search_api_key + '&q=' + encodeURIComponent(message)
		}, function(response) {
			response.setEncoding('utf8');
			response.on('data', function(chunk){
				json += chunk;
			});
			response.on('end', function(){
				var response = JSON.parse(json);
				if (response.error) {
					callback(response.error.message);
				} else {
					var first = response.items[0];
					var title = first.title;
					var link = first.link;
					var out = link +' ('+ title +')';
					callback(null, out);
				}
			});
			request.end();
		}).on('error', callback);
	};

})(this);
