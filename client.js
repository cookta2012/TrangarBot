module.exports = function(host, port, channels){
	var net = require('net')
	, fs = require('fs');
	
	if(port && port.push){
		channels = port;
		port = 6667;
	}
	
	this.host = host;
	this.port = port;
	this.channels = channels;
	var self = this;

	var pingInterval = null;
	this.client = net.connect({ host: host, port: port || 6667 }, function(){
		self.client.write('NICK TrangarBot\r\n');
		self.client.write('USER TrangarBot TrangarBot ' + host + ' :TrangarBot\r\n');
		self.client.write('PING :'  + new Date().getTime() + '\r\n');
		pingInterval = setInterval(function(){
			self.client.write('PING :'  + new Date().getTime() + '\r\n');
		}, 30000);
	});

	var buffer = '';

	function replyMessage(originalMsg, replyMsg){
		var nickMatch = originalMsg[0].match(/:([^!]+)!/);
		var target = originalMsg[2];
		if(originalMsg[2] == 'TrangarBot' && nickMatch && nickMatch[1]){
			target = nickMatch[1];
		}
		//console.log('<- PRIVMSG ' + target + ' :' + replyMsg + '\r\n');
		self.client.write('PRIVMSG ' + target + ' :' + replyMsg + '\r\n');
	}

	function handleMessage(msg){
		fs.readdir('./actions/', function(err, files){
			if(err) return console.error(err);
			files.forEach(function(file){
				var url = require.resolve('./actions/' + file);
				delete require.cache[url];
				try {
					var message = require(url).onMessage;
					if(message){
						message.apply(self, [msg, function(reply){
							replyMessage(msg, reply);
						}]);
					}
				} catch(ex){
					console.log('Could not load module ' + file);
					console.log(ex);
				}
			});
		});
	}

	self.client.on('data', function(data){
		buffer += data.toString();
		var index = buffer.indexOf('\r');
		
		while(index >= 0){
			var str = buffer.substring(0, index);
			buffer = buffer.substring(index + 2);
			//console.log('-> ' + str);
			
			str = str.split(' ');
			for(var i = 4; i < str.length; i++){
				str[3] += ' ' + str[i];
			}
			str.splice(4, str.length - 3);
			
			handleMessage(str);
			
			index = buffer.indexOf('\r');
		}
	});

	self.client.on('error', function(){
		clearInterval(pingInterval);
		console.log('error!', arguments);
		setTimeout(function(){
			throw 'Break';
		}, 5000);
	});

	self.client.on('end', function(){
		console.log('disconnected');
	});

}
