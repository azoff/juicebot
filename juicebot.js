
var fs      = require('fs');
var sys     = require('sys');
var path    = require('path');
var async   = require('async');
var wobot   = require('wobot');
var conf    = fs.readFileSync('./conf/juicebot.json');
var opts    = JSON.parse(conf);
var channel = process.argv.length > 2 ? process.argv[2] : 'development';

opts.jid     = opts.org_id + '_' + opts.user_id + '@' + opts.servers.user;
opts.channel = opts.org_id + '_' + channel + '@' + opts.servers.channel;
var bot      = new wobot.Bot(opts);

function bootstrap(identifier, plugin) {
	var module = require(plugin);
	var route = new RegExp(opts.alias + '\\s+' + identifier + '\\s*(.*)$', 'i');
	bot.loadPlugin(identifier, { 
		load: function() {
			bot.onMessage(route, function(channel, from, message, matches){
				module.message.call(bot, from, matches[1].trim(), respond);
			});
		}
	});
}

function connect(callback) {
	console.info('> Connecting to server...');
	callback(null, bot.connect());
}

function error(condition, text) {
	console.error(condition + ':', text);
}

function plugins(callback) {
	console.info('> Loading plugins...');
	async.waterfall([
		async.apply(fs.readdir, './plugins'),
		function(files, callback) {
			files.forEach(function(file) {
				console.info(' >', file);
				var identifier = path.basename(file, '.js');
				var plugin = './' + path.join('plugins', file);
				bootstrap(identifier, plugin);	
			});
			callback();
		}
	], callback);
}

function respond(e, msg) {
	if (e) { error('Plugin Error', e); }
	if (msg) { bot.message(opts.channel, msg); }
}

bot.onConnect(function(){
	console.info('> Joining channel...');
	bot.join(opts.channel);
	console.info('> Ready!');
});

bot.onDisconnect(function(){
	console.info('> Disconnected!');
	connect(function(e){
		if (e) { error(e); }
	});
});

bot.onError(error);

async.series([plugins, connect]);