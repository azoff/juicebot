(function(exports){
	
	"use strict";
	
	var http   = require('http');
	var jsdom  = require('jsdom');
	var jquery = require('jquery');

	function getjQuery(window) {
		return function(selector, context) {
			return jquery(selector, context || window.document);
		}
	}

	// get a random image from the sleepynick html
	function respond(html, callback) {
		jsdom.env(html, function(error, window) {
			if (error) { callback(error); }
			else {
				var $ = getjQuery(window),
					images = $('.post img'),
					image = images[Math.floor(Math.random() * images.length)].src;
				callback(null, '<img src="'+image+'" />');
			}
		});
	}

	exports.message = function(from, message, callback) {	
		var html = '';
		var request = http.get('http://sleepynick.tumblr.com/', function(response) {
			response.setEncoding('utf8');
			response.on('data', function(chunk) { html += chunk; });
			response.on('end', function() {
				respond(html, callback); 
			});
		}).on('error', callback);
	};

})(this);
