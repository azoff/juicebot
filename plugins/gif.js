(function(exports){
	
	"use strict";

	exports.message = function(from, message, callback) {
		var slug = message.replace(/\W+/g, '-');
		callback(null, 'http://' + slug + '-animated-gif.jpg.to/');
	};
	
})(this);
