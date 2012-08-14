JuiceBot
========
A plugin-based robot for HipChat

Getting Started
---------------
Fork or clone the juicebot project.

```sh
$> git clone git://github.com/azoff/juicebot.git
```

Add your own juicebot.json file. You can get the necessary values from [your HipChat XMPP profile](https://rentjuice.hipchat.com/account/xmpp). This example shows an account with
Jabber ID `xxxx_yyyy@chat.hipchat.com` and password `zzzz`.

```json
{
	"alias":	"@bot",
    "org_id":   "xxxx", 
    "user_id":  "yyyy",
    "password": "zzzz",
	"caps_ver": "JuiceBot:0.1",
	"debug":    false,
    "servers":  { 
		"user": "chat.hipchat.com/bot", 
		"channel": "conf.hipchat.com" 
	}
}
```

Install dependencies

```sh
sudo apt-get install libexpat1-dev libicu-dev
npm install
```

Run the server. You may optionally add a room name (defaults to the `development` channel)

```sh
$> node juicebot.js development
```

When the server detects a `command` in it's XMPP channel, it will run the corresponding plugin (assuming one exists). Argument requirements, if any, are specified by the underlying plugin.

```yaml
# in hipchat...
You: @bot command [arguments...]

# for instance, the 'help' command runs the 'help.js' plugin
You: @bot help
Bot: Usage: @bot ...
```

Creating Plugins
----------------
New plugins will automatically load whenever the server is restarted. To add a new plugin, create a `.js` file in the `plugins` folder. The basename of the file will be the command name. For instacnce, `help` maps to `help.js`. Plugins
are nothing more than AMD modules, and they only need specify the `message` method. For instance, here is the 
implementation of the `echo` module, which echo's back the arguments passed in by the caller:

```javascript
(function(exports){
	
	"use strict";

	exports.message = function(from, message, callback) {
		callback(null, message);
	};
	
})(this);
```