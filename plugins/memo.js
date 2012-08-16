(function(exports){

	"use strict";
	
	var fs    = require('fs');
	var conf  = './conf/memo.json';
	var async = require('async');
	var json  = fs.readFileSync(conf, 'utf8');
	var db    = JSON.parse(json);

	// TODO: getting callback is undefined
	function stats(prefix, out, callback) {
		var count = Object.keys(db).length;
		callback(prefix + ', ' + count + ' now entries in the database.');
	}

	function set(key, message, callback) {
		db[key] = message;
		json = JSON.stringify(db, null, 4);
		async.waterfall([
			async.apply(fs.writeFile, conf, json)
			//, async.apply(stats, 'Key "' + key + '" saved') 
		], callback);
	}
	
	function remove(key, callback) {
		if (delete db[key]) {
			async.waterfall([
				async.apply(fs.writeFile, conf, json)
				//, async.apply(stats, 'Key "' + key + '" deleted')
			], callback);
		} else {
			callback('Unable to find entry for "'+key+'" in the database!')
		}
	}

	function get(key, callback) {
		if (key in db) { callback(null, db[key]) }
		else { callback('Unable to find entry for "'+key+'" in the database!'); }
	}

	exports.message = function(from, message, callback) {	
		var words = message.split(/\s+/);
		var key = words.shift();
		var value = words.join(' ');
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
