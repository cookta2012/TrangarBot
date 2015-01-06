exports.onMessage = function(msg, reply){
	if(msg[0] == 'PING'){
		this.client.write('PONG ' + msg[1] + '\r\n');
	}
}