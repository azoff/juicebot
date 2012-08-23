(function(exports){
	
	"use strict";
	
	var state;
	var http   = require('http');
	var host   = '192.168.1.143'; 
	var lights = ['red', 'yellow', 'green'];
	var modes  = ['off', 'on'];

	function request(options, callback) {
		state = [];
		options.host = host;
		var request = http.request(options, function(response){			
			response.setEncoding('utf8');
			response.on('data', state.push.bind(state));
			response.on('end', function(){
				state = state.join('').split('');
				callback(null, state);
			});
		}).on('error', callback);		
		request.end();
	}

	function respond(light, callback) {
		callback(null,
			lights[light] + ' is ' + modes[state[light]]
		);
	}

	exports.message = function(from, message, callback) {	
		var options  = { method: 'POST' };
		var commands = message.trim().toLowerCase().split(/\s+/g, 2);
		var light    = lights.indexOf(commands[0]);
		var mode     = modes.indexOf(commands[1]);
		if (light < 0) {
			callback(null, 'Usage: blinky red|yellow|green [on|off]');
		} else {
			if (mode < 0) { 
				mode = state[light] == '1' ? 0 : 1; 
			}
			options.path = '/' + light + mode;
			request(options, function(error, state){
				if (error) { callback(error); }
				else { respond(light, callback); }
			});
		}
	};
	
	exports.load = function() {
		request({ method: 'OPTIONS' }, function(error){
			if (error) { throw error; }
		});
	};

})(this);
