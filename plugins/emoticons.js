(function(exports){
	
	"use strict";
	
	var http   = require('http');
	var jsdom  = require('jsdom');
	var jquery = require('jquery');
	var async  = require('async');

	function getjQuery(window) {
		return function(selector, context) {
			return jquery(selector, context || window.document);
		}
	}

	function getText(filter, i, shortcut) {
		var command = jquery(shortcut).text().trim();
		var name = command.replace(/\W+/g, '');
		return (filter.test(command) && name.length > 2) ?
			(name + ' ' + command) :
			undefined;
	}

	function respond(message, html, callback) {
		jsdom.env(html, function(error, window) {
			if (error) { callback(error); }			
			else {
				var $ = getjQuery(window);
				var filter = message !== 'recent' ? new RegExp(message || '.*', 'i') : /.*/;
				var mapper = async.apply(getText, filter);
				var shortcuts = jquery.makeArray($('.emoticons:first .shortcut').map(mapper));
				if (message === 'recent') {
					shortcuts = shortcuts.slice(0, 5);
				} else {	
					shortcuts = shortcuts.sort();
				}
				if (shortcuts.length) {
					async.forEach(shortcuts, async.apply(callback, null));
				} else {
					callback(null, 'I couldn\'t find any emoticons matching "'+message+'"')
				}
			}
		});
	}

	exports.message = function(from, message, callback) {	
		var html = '';
		var url = 'http://hipchat-emoticons.nyh.name/' + (message === 'recent' ? '?order=recent' : '');
		var request = http.get(url, function(response){
			response.setEncoding('utf8');
			response.on('data', function(chunk){ html += chunk; });
			response.on('end', function(){ 
				respond(message.trim(), html, callback); 
			});
		}).on('error', callback);
	};

})(this);