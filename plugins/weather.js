(function(exports) {

	"use strict";

	var http = require('http');
	var jsdom = require('jsdom');
	var jquery = require('jquery');

	function getjQuery(window) {
		return function(selector, context) {
			return jquery(selector, context || window.document);
		}
	}

	function respond(message, html, callback) {
		jsdom.env(html, function(error, window) {
			if (error) {
				callback(error);
			} else {
				var $ = getjQuery(window);
				var $rail = $('#wx-inner-rail');
				var $module = $rail.find('.wx-module:first');
				var mydata = [];
				var timestamp = $module.find('.wx-timestamp:first').find('.wx-value').text().trim();
				var locname = $module.data('location-presentation-name').trim();
				var temp = $module.find('.wx-temp:first').text().trim();
				var output = [locname, ' is ', temp, ' at ', timestamp];
				callback(null, output.join(''));
			}
		});
	}

	exports.message = function(from, message, callback) {
		var html = '';
		var request = http.get('http://www.weather.com/weather/right-now/USCA0987:1', function(response) {
			response.setEncoding('utf8');
			response.on('data', function(chunk) {
				html += chunk;
			});
			response.on('end', function() {
				respond(message || from.split(/\s+/).shift(), html, callback);
			});
		}).on('error', callback);
	};

})(this);
