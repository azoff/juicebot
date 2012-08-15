(function(exports){
	
	"use strict";

	exports.message = function(from, message, callback) {
		callback(null, JSON.stringify({
			hrtime: process.hrtime(),
			memory: process.memoryUsage()
		}));
	};
	
})(this);