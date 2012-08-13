(function(exports){
	
	"use strict";

	exports.message = function(from, message, callback) {
		var commands = Object.keys(this.plugins).join(', ');
		callback(null, 'Usage: @bot command [arguments]\n  commands: ' + commands);
	};
	
})(this);