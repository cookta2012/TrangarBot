var http = require('http');

exports.onMessage = function(msg, reply){
	if(this.lastFactorioFFCheckTime && new Date().getTime() - this.lastFactorioFFCheckTime < 600000){
		return;
	}
	this.lastFactorioFFCheckTime = new Date().getTime();
	
	var self = this;
	
	
	http.get('http://www.factorio.com/', function(res) {
		res.setEncoding('utf8');
		var buffer = '';
		res.on('data', function (chunk) {
			buffer += chunk;
		});
		res.on('end', function(){
			var match = /ff-(\d+)/g.exec(buffer);
			if(!match){
				return;
			}
			var ff = match[1];
			if(self.lastFactorioFacts && self.lastFactorioFacts != ff){
				self.client.write('PRIVMSG #factorio :New factorio facts: ' + ff + ' http://factorio.com/blog/post/fff-' + ff + '\r\n');
			}
			self.lastFactorioFacts = ff;
		});
	});
}