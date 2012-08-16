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

	function respond(message, html, callback) {
		jsdom.env(html, function(error, window) {
			if (error) { callback(error); }			
			else {
				var $ = getjQuery(window);
				var insult = $('.blurb_title_1:first').text().trim();
				callback(null, message + ', ' + insult);
			}
		});
	}

	exports.message = function(from, message, callback) {	
		var html = '';
		var request = http.get('http://toykeeper.net/programs/mad/compliments', function(response){
			response.setEncoding('utf8');
			response.on('data', function(chunk){ html += chunk; });
			response.on('end', function(){ 
				respond(message||from.split(/\s+/).shift(), html, callback); 
			});
		}).on('error', callback);
	};

})(this);
