var http = require('http');

exports.onMessage = function(msg, reply){
	if(this.lastFactorioCheckTime && new Date().getTime() - this.lastFactorioCheckTime < 600000){
		return;
	}
	this.lastFactorioCheckTime = new Date().getTime();
	
	var self = this;
	
	
	http.get('http://www.factorioforums.com/forum/viewforum.php?f=3', function(res) {
		res.setEncoding('utf8');
		var buffer = '';
		res.on('data', function (chunk) {
			buffer += chunk;
		});
		res.on('end', function(){
			var match = /<a href="([^"]*)"[^>]*topictitle">([^<]*)</g.exec(buffer);
			if(!match){
				return;
			}
			var url = match[1];
			var version = match[2];
			if(self.lastFactorioVersion && self.lastFactorioVersion != version){
				self.client.write('PRIVMSG #factorio :' + version + ' released. http://factorioforums.com/forum' + (url.substring(1).replace(/&amp;/g, '&')) + '\r\n')
			}
			self.lastFactorioVersion = version;
		});
	});
}