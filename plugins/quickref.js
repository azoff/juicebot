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

	function analyze(html, callback) {
		jsdom.env(html, function(error, window) {
			if (error) { callback(error); }			
			else {
				var $ = getjQuery(window);				
				var matches = $('.refsect1.description,.refsect1.parameters,.refsect1.returnvalues');
				var alternates = $('#quickref_functions a');
				if (alternates.size()) {
					alternates.each(function(i){
						if (i < 10) {
							var target = $(this);
							callback(null, [target.text().trim(), ': http://us.php.net', target.attr('href')].join(''));
						} else {
							return false;
						}
					});
				} else {
					var out = '';
					matches.find('.title,.methodsynopsis,.rdfs-comment,.term .parameter,.para').each(function(){
						var target = $(this);
						if (target.is('h3')) { 
							out += '\n=============\n' + target.text() + '\n=============\n';
						} else if (target.is('.methodsynopsis')) {
							out += target.text().replace(/\s+/g, ' ');
						} else if (target.is('.parameter,.rdfs-comment')) {
							out += '\n  ' + target.text().trim() + '\n';
						} else if (!target.is('.para') || target.closest('.returnvalues,dd').size()) {
							out += target.text();
						}
					});
					callback(null, out);
				}
			}
		});
	}

	exports.message = function(from, message, callback) {	
		var options = {
		    host: 'us.php.net',
		    path: '/manual-lookup.php?scope=quickref&pattern=' + encodeURIComponent(message)
		};
		var parse = function(response) {
			if (response.statusCode === 302) {
				request = http.get(response.headers.location, parse).on('error', callback);
			} else {
				var html = '';
				if (response.headers.link) {
					callback(null, response.headers.link.match(/<(.*?)>/).pop());
				} else {
					callback(null, '"' + message + '" not found!')
				}
				response.setEncoding('utf8');
				response.on('data', function(chunk){ html += chunk; });
				response.on('end', function(){ analyze(html, callback); });
			}			
			request.end();
		};
		var request = http.get(options, parse).on('error', callback);
	};

})(this);
