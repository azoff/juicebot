(function(exports){

	/**
	 * You'll need a yelp conf file (./conf/yelp.json) to load this plugin...
	 * use the api data from http://www.yelp.com/developers/documentation/v2/search_api
	 */

	"use strict";
	
	var fs    = require('fs');
	var async = require('async');
	var https = require('https');
	var conf  = fs.readFileSync('./conf/yelp.json');
	var opts  = JSON.parse(conf);
	var yelp  = require("yelp").createClient(opts);
	var sorts = ['relavence','distance','rating'];

	function isArgs(part) {
		var args = part.split('=');
		return args.length > 1 ? args : false;
	}

	function addParameter(parameters, part, args){
		if (args = isArgs(part)) {
			switch (args[0]) {
				case 'sort':
					args[1] = sorts.indexOf(args[1]);
					args[1] = args[1] > 0 ? args[1] : 0;
					break;
				case 'page':
					args[0] = 'offset';
					args[1] = parameters.limit * args[1];
					break;
				case 'categories':
					args[0] = 'category_filter';
					break;
				case 'radius':
				case 'distance':
					args[0] = 'radius_filter';
				case 'deals':
					args[0] = 'deals_filter';
			}
			parameters[args[0]] = args[1];
		} else {
			parameters.terms.push(part.trim());
		}
	}

	// see http://www.yelp.com/developers/documentation/v2/search_api
	function parseParameters(message) {
		var parts = message.trim().split(/\s+/g);
		var parameters = {
			terms: [], limit: 1,
			offset: 0, sort: 0,
			radius_filter: 500,
			location: opts.location
		};
		parts.forEach(async.apply(addParameter, parameters));
		parameters.term = parameters.terms.join(' ');
		delete parameters.terms;
		return parameters;
	}
	
	function formatBusiness(messages, business) {
		var message = ['\n' + business.name + ' (' + (business.rating||'No') + ' Stars, ' + business.review_count + ' Reviews)\n========================================'];
		if (business.snippet_text) {
			message.push('  "' + business.snippet_text.replace(/\s+/g, ' ') + '"');
		} 
		if (business.display_phone) {
			message.push('  ' + business.display_phone);
		}
		if (business.display_address) {
			message.push('  ' + business.display_address.join('\n\t'));
		} else if (business.location.cross_streets) {
			message.push('  ' + business.location.cross_streets);
		} else if (business.location.address) {
			message.push('  ' + business.location.address);
		}
		messages.push(message.join('\n'));
		messages.push(business.url);
	}
	
	function formatOutput(parameters, data, socket, callback) {
		var page = Math.floor(parameters.offset / parameters.limit) || 1;
		var pages = Math.floor(data.total / parameters.limit) || 1;
		var messages = ['Found ' + data.total + ' results matching "' + parameters.term + '" (page '+page+' of '+pages+')'];
		data.businesses.forEach(async.apply(formatBusiness, messages));
		async.forEachSeries(messages, function(message, next){
			callback(null, message);
			setTimeout(next, 500);
		});
	}

	exports.message = function(from, message, callback) {	
		var parameters = parseParameters(message);
		async.waterfall([
			async.apply(yelp.search.bind(yelp), parameters),
			async.apply(formatOutput, parameters)
		], callback);
	};

})(this);
