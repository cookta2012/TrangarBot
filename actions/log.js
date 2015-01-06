var tedious = require('tedious');

exports.onMessage = function(msg){
	doSendMessage(msg, true);
}

function doSendMessage(msg, isFirst){
	var index = msg[0].indexOf('!');
	if(index == -1) return;

	var host = msg[0].substring(index + 1);
	if(host && host[0] == '~') host = host.substring(1);
	var nick = msg[0].substring(1, index);
	var type = msg[1];
	var channel = msg[2];
	var message = msg[3] || '';
	if(message[0] == ':') message = message.substring(1);
	var raw = msg.join(' ');
	
	if(nick != 'TrangarBot'){
		var start = new Date().getTime();
		var connection = new tedious.Connection({
			options: {
				database: '', // TODO: mssql database database
				encrypt: true
			},
			rowCollectionOnDone: true,
			server: '', // TODO: mssql database server
			userName: '', // TODO: mssql database username
			password: '' // TODO: mssql database password
		});
		var self = this;
		connection.on('connect', function(err){
			saveHost(connection, host, nick, channel, message, raw, type, function(err){
				if(err && isFirst){
					console.log('Attempt nr 2');
					exports.onMessage(msg, false);
				}
			});
		});
		connection.on('error', function(err){
			console.error('logging error', err);
			if(isFirst){
				console.log('Attempt nr 2');
				exports.onMessage(msg, false);
			}
		});
	}
}

function saveMessage(connection, hostID, nickID, channelID, message, raw, type, done){
	var request = new tedious.Request('Message_Save', function(err){
		if(err){
			console.log('\nCould not save message\n', err);
		}
		done(err);
	});
	
	request.addParameter('NickID', tedious.TYPES.Int, nickID);
	request.addParameter('ChannelID', tedious.TYPES.Int, channelID);
	request.addParameter('HostID', tedious.TYPES.Int, hostID);
	request.addParameter('Content', tedious.TYPES.NVarChar, message);
	request.addParameter('Type', tedious.TYPES.NVarChar, type);
	request.addParameter('Raw', tedious.TYPES.NVarChar, raw);
	
	connection.callProcedure(request);
}
function saveChannel(connection, hostID, nickID, channel, message, raw, type, done){
	var channelID;
	var request = new tedious.Request('Channel_Save', function(err) {
		if(err){
			console.log('\nCould not save channel\n', err);
			return done(err);
		}
		saveMessage(connection, hostID, nickID, channelID, message, raw, type, done);
	});
	
	request.on('row', function(row){
		channelID = row[0].value;
	});

	request.addParameter('Name', tedious.TYPES.NVarChar, channel);

	connection.callProcedure(request);
	
}
function saveNick(connection, hostID, nick, channel, message, raw, type, done){
	var nickID;
	var request = new tedious.Request('Nick_Save', function(err) {
		if(err){
			console.log('\nCould not save nick\n', err);
			return done(err);
		}
		saveChannel(connection, hostID, nickID, channel, message, raw, type, done);
	});
	
	request.on('row', function(row){
		nickID = row[0].value;
	});

	request.addParameter('HostID', tedious.TYPES.Int, hostID);
	request.addParameter('NickName', tedious.TYPES.NVarChar, nick);

	connection.callProcedure(request);
}

function saveHost(connection, host, nick, channel, message, raw, type, done){
	var hostID;
	var request = new tedious.Request('Host_Save', function(err) {
		if(err){
			console.log('\nCould not save host\n', err);
			return done(err);
		}
		saveNick(connection, hostID, nick, channel, message, raw, type, done);
	});
	
	request.on('row', function(row){
		hostID = row[0].value;
	});

	request.addParameter('HostName', tedious.TYPES.NVarChar, host);

	connection.callProcedure(request);
}