exports.czdiscovery = {
    'enabled': false,
    'key' : 'http-api-local'
}

exports.elasticsearch = {
    index : 'agenda-test',
    hosts : [{
        'host' : '10.7.50.110',
        'port' : 9200
    }]
}

exports.server = {
    'host' : 'localhost',
    'port' : 3000
}

exports.redis = {
    'host' : '10.7.50.119',
    'port' : 6379,
    'keyTTL' : 3600,
    'db' : 2
}


exports.oauth = {
	
	consumer_token : "WqwaFDGgfwuAhta5O6",
	consumer_secret : "t2aX7mpZDJKwVivq2mUYn12UAl3VpsfJ",
	
	access_token : 'rkPs43b7LJO3TXAEDk',
	access_secret : '4T2LLM9AGMz5j5Dzg57UvnLgjZLy8zCt'
}

exports.lastSeenUpdateFrequency = 10000;