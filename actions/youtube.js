var https = require('https');

exports.onMessage = function(msg, reply){
	if(msg[0].substring(0, 9) == ':PervyBot' || !msg[3] || msg[1] == '332'
	|| msg[0].substring(0, 7) == ':Bleigh'){
		return;
	}
	var regex = /youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-_]*)(&(amp;)?[\w\?=]*)?/g;
	var match;
	while ((match = regex.exec(msg[3])) != null) {
		if (match.index === regex.lastIndex) {
			regex.lastIndex++;
		}

		lookupVideo(match[1], function(err, data){
			if(err){
				console.log(err);
				return;
			}
			if(!data || !data.items || !data.items[0]){
				console.log('Could not load youtube', match);
				require('fs').writeFile('youtube.json', JSON.stringify(data));
				return;
			}
			var result = 'http://youtu.be/' + data.items[0].id + ' ' + data.items[0].snippet.channelTitle + ': ';
			result += data.items[0].snippet.title + ' (time: ' + getTime(data.items[0].contentDetails.duration) + ', views: ' + formatLargeNumber(data.items[0].statistics.viewCount);
			result += ', rating: ' + getRating(data.items[0].statistics.likeCount, data.items[0].statistics.dislikeCount) + ')';
			reply(result);
		});
	}
}

function getTime(dt){
	var time = '';
	var regex = /(\d+)(\w)/g;
	var match;
	while((match = regex.exec(dt)) != null){
		if (match.index === regex.lastIndex) {
			regex.lastIndex++;
		}
		if(match[2] == 'H') time += match[1] + ' hours ';
		if(match[2] == 'M') time += match[1] + ' minutes ';
		if(match[2] == 'S') time += match[1] + ' seconds ';
	}
	return time.trim();
}

function getRating(plus, min){
	plus = parseInt(plus);
	min = parseInt(min);
	return formatLargeNumber(plus) + '/' + formatLargeNumber(min) + '(' + Math.round((plus / (plus + min)) * 100) + '%)';
}

function formatLargeNumber(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function lookupVideo(id, done){
	https.get('https://www.googleapis.com/youtube/v3/videos?id=' + id + '&key=AIzaSyA8g7H2G48JI4_UTKgKWCgt8wXU5h58gDM%20&part=snippet,contentDetails,statistics', function(res) {
		res.setEncoding('utf8');
		var buffer = '';
		res.on('data', function (chunk) {
			buffer += chunk;
		});
		res.on('end', function(){
			try {
				var data = JSON.parse(buffer);
				done(null, data);
			} catch(ex){
				done(ex);
			}
		});
	});
}