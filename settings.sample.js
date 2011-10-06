
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
	'keyTTL' : 3600
}

exports.schema = {
	user : "/schema/6cbf5d5f9c7675cc1c5e2025676210d4"
}
