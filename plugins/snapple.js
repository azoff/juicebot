(function(exports){
	
	"use strict";
	
	var http   = require('http');
	var jsdom  = require('jsdom');
	var jquery = require('jquery');
	var max    = 927;	
	var facts  = new Array(max);

	function getjQuery(window) {
		return function(selector, context) {
			return jquery(selector, context || window.document);
		}
	}
	
	function adder(match, index, fact) {
		index = parseInt(index, 10)-1;
		if (facts[index]) {
			facts[index].push(fact.trim());
		} else {
			facts[index] = [fact.trim()];
		}
		return match;
	}
	
	function parse(html) {
		jsdom.env(html, function(error, window){
			if (error) { 
				throw error; 
			} else {
				var $ = getjQuery(window);
				var body = $('.date-posts').text().replace(/\.\s*•/g, ';');
				body.replace(/(\d+)\s+(.+?)\./g, adder);
			}
		});
	}

	function getFact(name, number, callback) {
		var fact = facts[number-1];
		if (fact) {
			fact = 'Fact #'+number+': '+fact.join('. ');
			if (callback) { callback(null, fact); }
		} else if (callback) {
			callback(null, 'Sorry '+name+', I don\'t know fact #'+number+'!');
		}
		return fact;
	}

	exports.message = function(from, message, callback) {	
		var name = from.split(/\s/).shift();
		var random = !(message = message.trim());
		var number = random ? 1 : parseInt(message, 10);
		if (number < 1 || number > max) {
			callback('Sorry '+name+', Please choose between facts #1-'+max+'...');
		} else if (random) {
			while(!(random = getFact(name, Math.floor(Math.random()*(max+1))+1)));
			callback(null, random);
		} else {
			getFact(name, number, callback);
		}
	};
	
	exports.load = function() {
		var html = '';
		var request = http.get('http://mysnapplerealfacts.blogspot.com/', function(response){
			response.setEncoding('utf8');
			response.on('data', function(chunk){ html += chunk; });
			response.on('end', function(){ parse(html); });
		}).on('error', function(error){
			throw error;
		});
	}

})(this);
