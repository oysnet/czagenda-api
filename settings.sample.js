
exports.czdiscovery = {
	'enabled': true,
	'key' : 'http-api'
}

exports.elasticsearch = {
	index : 'agenda',
	hosts : [{
		'host' : '10.7.50.110',
		'port' : 9200
	}]
}

exports.server = {
	'host' : '%IP%',
	'port' : 3000
}

exports.redis = {
	'host' : '10.7.50.119',
	'port' : 6379,
	'keyTTL' : 3600,
	'db' : 0
}

exports.lastSeenUpdateFrequency = 10000;