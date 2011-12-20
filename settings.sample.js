
exports.czdiscovery = {
	'enabled': true,
	'key' : 'http-api'
}

exports.elasticsearch = {
	index : '%ES_INDEX%',
	hosts : [{
		'host' : '%ES_IP%',
		'port' : 9200
	}]
}

exports.server = {
	'host' : '%IP%',
	'port' : 3000
}

exports.redis = {
	'host' : '%REDIS_IP%',
	'port' : 6379,
	'keyTTL' : 3600,
	'db' : 0
}

exports.validator = {
    'refreshFrequency' : 1000
}

exports.lastSeenUpdateFrequency = 10000;