var http = require('http'),
	url = require('url');


function makeRequest(site){
	var parsed = url.parse(site);
	var req = http.request({
		hostname: parsed.host,
		port: 80,
		path: parsed.path,
		method: 'GET',
		headers: {
			'user-agent': 'test'
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
				console.log(data[0].data.children[0].data.url);
			} catch(ex){
				console.log(ex);
			}
		});
	});
	req.end();
}

makeRequest('http://api.reddit.com/r/penis/random');