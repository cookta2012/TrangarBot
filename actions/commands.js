var commands = {
	'mp': [
		'Multiplayer information',
		' - Need help with multiplayer? http://www.factorioforums.com/wiki/index.php?title=Multiplayer',
		' - Find a multiplayer game: https://www.evolvehq.com/groups/factoriohydra'
	],
	'links': [
		'Useful links',
		' - Production calculator: http://rubyruy.github.io/factorio-calc',
		' - Foreman tool: http://factorioforums.com/forum/viewtopic.php?f=8&t=5576'
	],
	'choochoo': [
		'http://i.imgur.com/xnh7rOV.jpg'
	]
}

function hasCooldown(client, msg){
	if(!client.cooldown) client.cooldown = {};
	if(!client.cooldown[msg] || client.cooldown[msg] < (new Date().getTime() - 60000)){
		client.cooldown[msg] = new Date().getTime();
		return false;
	}
	return true;
}

exports.onMessage = function(msg, reply){
	if(msg[3] && msg[2] == '#factorio'){
		var command = msg[3].substring(2).trim();
		if(command == 'help' && !hasCooldown(this, 'help')){
			var result = '';
			for(var x in commands){
				if(result) result += ', ';
				result += '!' + x;
			}
			reply('Commands: ' + result + ' ( all commands have a 1 minute cooldown )');
		}
		if(commands[command] && !hasCooldown(this, command)){
			commands[command].forEach(function(command){
				reply(command);
			});
		}
	}
}