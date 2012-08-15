(function(exports){
	
	"use strict";

	var async = require('async');

	exports.message = function(from, message, callback) {
		var msg = new Array(7).join('.\n');
		var msgs = new Array(parseInt(message||10, 10)).join(msg+'\t').split('\t');
		async.forEach(msgs, function(msg, next){
			next(null, callback(null, msg));
		})
	};
	
})(this);