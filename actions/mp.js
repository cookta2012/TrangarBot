var http = require('http');

exports.onMessage = function(msg, reply){
	if(msg[2] == '#factorio' && msg[3] && msg[1] != '332'){
		var regex = /factorioforums.com\/forum\/viewtopic\.php\?f=(\d+)&t=(\d+)/g;
		var match;
		
		while ((match = regex.exec(msg[3])) != null) {
			if (match.index === regex.lastIndex) {
				regex.lastIndex++;
			}
			var url = match[0];
			lookupForumPost(url, function(err, title){
				if(err){
					console.log(err);
					return;
				}
				reply(title + '          http://' + url);
			});
		}
		
	}
} 

function lookupForumPost(url, done){
	var titleRegex = /<title>.*? - (.*)<\/title>/;
	http.get('http://' + url, function(res) {
		res.setEncoding('utf8');
		var buffer = '';
		res.on('data', function (chunk) {
			buffer += chunk;
		});
		res.on('end', function(){
			try {
				var data = titleRegex.exec(buffer);
				done(null, data[1]);
			} catch(ex){
				done(ex);
			}
		});
	});
}
