exports.onMessage = function(msg, reply){
	client = this.client;
	if(msg[1] == '376'){
		client.write('PRIVMSG NickServ :identify TrangarBot ATrIamC5GVPz0dKmEVFv\r\n');
		this.channels.forEach(function(channel){
			client.write('JOIN ' + channel + '\r\n');
		})
	}
	if(msg[1] == 'JOIN' && msg[2] == '#Tiriaq'){
		var nickMatch = msg[0].match(/:([^!]+)!/);
		//console.log('MODE #Tiriaq +o ' + nickMatch[1]);
		client.write('MODE #Tiriaq +o ' + nickMatch[1] + '\r\n');
	}
}