var Rest = require('../libs/rest-client-classic').Rest,
	fs=require('fs');

var rest = new Rest('10.7.50.110', 9200);
rest.post('/agenda-dev/_search',JSON.stringify({size:1000}),function(err, res, data) {
	
	var data = JSON.parse(data),  dumps = [];
	
	for (var i = 0, l = data.hits.hits.length; i<l; i++) {
		var d = data.hits.hits[i];
		dumps.push("curl -XPUT http://10.7.50.110:9200/" + d._index + "/" + d._type + "/" + encodeURIComponent(d._id) + " -d '" + JSON.stringify(d._source) + "';");
		
	}
	
	  fs.writeFile('./dumps/agenda-dev.sh', dumps.join('\n'), function (err) {
	  if (err) throw err;
	  console.log('It\'s saved!');
	});
	
});
