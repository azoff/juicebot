(function(exports){

	"use strict";
	
	var fs    = require('fs');
	var conf  = './conf/memo.json';
	var async = require('async');
	var json  = fs.readFileSync(conf, 'utf8');
	var db    = json ? JSON.parse(json) : {};

	function set(key, message, callback) {
		db[key] = message;
		json = JSON.stringify(db, null, 4);
		async.waterfall([
			async.apply(fs.writeFile, conf, json),
			function(next) { next(null, 'Ok, I\'ll remember "'+key+'"'); } 
		], callback);
	}
	
	function remove(key, callback) {
		if (key in db) {
			delete db[key];
			json = JSON.stringify(db, null, 4);
			async.waterfall([
				async.apply(fs.writeFile, conf, json),
				function(next) { next(null, 'Ok, I\'ll forget "'+key+'"'); }
			], callback);
		} else {
			callback(null, 'I can\'t remember anything about "'+key+'"...')
		}
	}

	function get(key, callback) {
		if (key in db) { callback(null, db[key]) }
		else { callback(null, 'I can\'t remember anything about "'+key+'"...'); }
	}

	exports.message = function(from, message, callback) {	
		var words = message.split(/\s/g);
		var key = words.shift().trim();
		var value = words.join(' ').trim();
		if (words.length) {
			set(key, value, callback);
		} else if (key.indexOf(':') === 0) {
			key = key.substr(1);
			remove(key, callback);
		} else {
			get(key, callback);
		}
	};

})(this);
