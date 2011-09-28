ElasticSearchClient = require('elasticSearchClient');

var serverOptions = {
	hosts : [{
		host : '10.7.50.101',
		port : 9200,
	}]
};

var elasticSearchClient = new ElasticSearchClient(serverOptions);

var q = {
	"query" : {
		"filtered" : {
			"query" : {
				"match_all" : {}
			},
			"filter" : {"geo_bounding_box":{"event.where.geoPt":{"top_left":[-0.4, 44],"bottom_right":[-0.1, 40]}}}
		}
	}
};

elasticSearchClient.search('agenda', 'event', q).on('data', function(data) {
	console.log(JSON.parse(data))
}).on('done', function() {
	//always returns 0 right now
}).on('error', function(error) {
	console.log(error)
}).exec()