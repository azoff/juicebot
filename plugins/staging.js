(function(exports){

	"use strict";

	var user = '';
	var out = '';

	exports.message = function(from, message, callback) {
		if (message.length) {
			user = message;
			out = '@'+ user +' now has dibbs on staging.';
		} else {
			out = '@'+ user +' is currently on staging.';	
		}
		callback(null, out);
	};

})(this);
