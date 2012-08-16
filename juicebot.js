
var fs      = require('fs');
var sys     = require('sys');
var path    = require('path');
var async   = require('async');
var wobot   = require('wobot');
var conf    = fs.readFileSync('./conf/juicebot.json');
var opts    = JSON.parse(conf);
var channel = process.argv.length > 2 ? process.argv[2] : 'development';
var alias   = new RegExp('\\s*'+opts.alias+'\\s*');
var noop	= function(){};

opts.jid     = opts.org_id + '_' + opts.user_id + '@' + opts.servers.user;
opts.channel = opts.org_id + '_' + channel + '@' + opts.servers.channel;
var bot      = new wobot.Bot(opts);

function bootstrap(identifier, plugin) {
	try {
		var module = require(plugin);
		if (!module.load) { module.load = noop; }
		bot.loadPlugin(identifier, module);
	} catch (e) {
		error('   > skipped: ', e);
	}
}

function connect(callback) {
	console.info('> Connecting to server...');
	callback(null, bot.connect());
}

function commandToJob(from, command, callback) {
	var parts = command.split(/\s/);
	var identifier = parts.shift().trim();
	var plugin = bot.plugins[identifier];
	var message = parts.join(' ').trim();
	callback(null, function job(input, output) {
		if (!output) { output = input; input = message; }
		else { input = message + ' ' + input; }
		if (plugin && plugin.message) {
			plugin.message.call(bot, from, input, output);
		} else {
			output(null, identifer + '? I\'m afraid I cant do that '+from.split(/\s+/).shift()+'...');
		}
	});
}

function delegate(channel, from, message) {
	if (alias.test(message)) {
		var commands = message.replace(alias, '').trim().split(/\s*\|\s*/g);
		var mapper   = async.apply(commandToJob, from);
		try {
			async.waterfall([
				async.apply(async.map, commands, mapper),
				async.waterfall
			], respond);
		} catch (e) {
			error('Plugin Error', e);
		}
	}
}

function error(condition, text) {
	text = condition + ': ' + text;
	console.error(text);
	bot.message(opts.channel, text);
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
			callback(null);
		}
	], callback);
}

function respond(e, msg) {
	if (e) { error('Plugin Error', e.message ? e.message : e); }
	if (msg) { bot.message(opts.channel, msg); }
}

bot.onConnect(function(){
	console.info('> Joining channel...');
	bot.join(opts.channel);
	bot.onMessage(delegate);
	bot.message(opts.channel, 'I\'m ready! ' + Object.keys(bot.plugins).sort().join(', '));
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