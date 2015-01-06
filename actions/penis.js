var http = require('http');

var responses = [
	'Teehee penis',
	'*giggles uncontrollably*'
];

exports.onMessage = function(msg, reply, client){
	if(msg[3] && msg[3].toLowerCase().trim() == ':!penis' && msg[2] == '#Tiriaq'){
		getPenis(function(err, data){
			var url = err || data;
			var n = Math.floor(Math.random() * responses.length);
			reply(responses[n] + ' ' + url);
		});
	}
}

function getPenis(done){
	function makeRequest(site){
		var parsed = require('url').parse(site);
		var req = http.request({
			hostname: parsed.host,
			port: 80,
			path: parsed.path,
			method: 'GET',
			headers: {
				'user-agent': 'TrangarBot IRC bot'
			}
		}, function(res){
			res.setEncoding('utf8');
			var buffer = '';
			res.on('data', function (chunk) {
				buffer += chunk;
			});
			res.on('end', function(){
				if(res.headers.location){
					return makeRequest(res.headers.location);
				}
				try {
					data = JSON.parse(buffer);
					done(null, data[0].data.children[0].data.url);
				} catch(ex){
					done(ex);
				}
			});
		});
		req.end();
	}

	makeRequest('http://api.reddit.com/r/penis/random');
}