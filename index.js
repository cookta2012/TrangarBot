var cluster = require('cluster')
	, cp = require('child_process')
	, client = require('./client');

if (cluster.isMaster) {
	process.stdout.write('\033c');
	cluster.fork();

	cluster.on('disconnect', function(worker) {
		console.error('cluster disconnect!');
		cluster.fork();
	});
	
	return;
}

var clients = [];
clients.push(new client('irc.esper.net', [
	'#trangarbot',
	'#tiriaq',
	'#factorio'
]));