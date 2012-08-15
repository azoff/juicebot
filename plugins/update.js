(function(exports){
	
	"use strict";
	
	var path = require('path');
	var async = require('async');
	var process = require('child_process');
	var cwd = path.dirname(__dirname);
	
	function arrayToString(arr) {
		var result, index = 0, length;
		length = arr.reduce(function(l, b) {
			return l + b.length;
		}, 0);
		result = new Buffer(length);
		arr.forEach(function(b) {
			b.copy(result, index);
			index += b.length;
		});
		return result.toString('utf8');
	}
	
	function execute() {
		var args = Array.prototype.slice.call(arguments);
		var command = args.shift();
		var callback = args.pop();
		var output = { stdout:[], stderr:[], code:-1 };
		var task = process.spawn(command, args, { cwd: cwd });
		task.stdout.on('data', function (data) {
			output.stdout.push(data);
		});
		task.stderr.on('data', function (data) {
			output.stderr.push(data);
		});
		task.on('exit', function(code){
			output.code = code;
		});
		task.on('close', function(){
			if (output.code > 0) {
				callback(arrayToString(output.stderr));
			} else {
				callback(null, arrayToString(output.stdout));
			}
		});
	}
	
	function reloadPlugins(bot) {
		return function (out, callback) {
			bot.reloadPlugins(callback);
		}
	}

	function formatOutput(newPlugins, callback) {
		var output = 'No new plugins detected.';
		if (newPlugins.length) {
			output = 'Loaded plugins: ' + newPlugins.join(' ');
		}
		callback(null, output);
	}

	exports.message = function(from, message, callback) {
		callback(null, 'Updating Plugins...'); 
		async.waterfall([
			async.apply(execute, 'git', 'pull', '--rebase', 'origin', 'master'),
			async.apply(execute, 'npm', 'install'),
			reloadPlugins(this),
			formatOutput
		], callback);
	};
	
})(this);