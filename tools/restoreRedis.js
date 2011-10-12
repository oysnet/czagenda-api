var redis = require('../libs/redis-client');
var redisClient = redis.redisClient;
var async = require('async');
var Rest = require('../libs/rest-client-classic').Rest;
var settings = require('../settings');
var urls = ['/schema/base-abstract', '/schema/geo', '/schema/localization', '/schema/who', '/schema/event'];
var log = require('czagenda-log').from(__filename);
var methods = [];

var populateAsync = function(cb) {

	log.notice('populateAsync start', settings.elasticsearch.hosts[0].host, settings.elasticsearch.hosts[0].port, settings.elasticsearch.index)

	var rest = new Rest(settings.elasticsearch.hosts[0].host, settings.elasticsearch.hosts[0].port), urls = [];

	rest.post('/' + settings.elasticsearch.index + '/_search', JSON.stringify({
		size : 1000000
	}), function(err, res, data) {

		log.notice('data fetched from elastic')

		var data = JSON.parse(data), dumps = [];

		for(var i = 0, l = data.hits.hits.length; i < l; i++) {
			var d = data.hits.hits[i];

			log.debug('found url ' + d._id)

			urls.push(d._id);
			urls.push(null);

			if(d._type === 'schema') {

				log.debug('found schema url')

				if(d._source.status === 'APPROVED') {
					methods.push( function(id, callback) {

						redisClient.sadd(redis.SCHEMA_APPROVED, id, function(err, nb) {

							log.debug('added to ' + redis.SCHEMA_APPROVED + ' ' + id)

							callback(err);
						});
					}.bind(this, d._id))
				} else if (d._source.status === 'PROPOSAL') {
					methods.push( function(id, author, callback) {

						redisClient.sadd(redis.PREFIX_SCHEMA_PROPOSAL + author, id, function(err, nb) {

							log.debug('added to ' + redis.PREFIX_SCHEMA_PROPOSAL + author + ' ' + id)

							callback(err);
						});
					}.bind(this, d._id, d._source.author))
				}

			}
		}

		methods.push(function(callback) {

			urls.push(function(err, nb) {

				if( typeof (err) !== 'undefined') {
					callback(err);
					return;
				}

				if(nb !== (urls.length - 1) / 2) {
					err = 'not all urls were added';
				}

				callback(err);
			});
			log.debug('add urls', urls.length)
			redisClient.msetnx.apply(redisClient, urls);
		})
		cb(err);
	});
}

redisClient.on('ready', function(err) {

	redisClient.flushdb(function(err) {

		if(err !== null) {
			log.warning('Error while flushing redis');
			redisClient.end();
			return;
		}

		populateAsync(function(err) {

			if(err !== null) {
				log.warning(err);
				redisClient.end();
				return;
			}

			async.parallel(methods, function(err) {

				if( typeof (err) === 'undefined') {
					log.notice('all done')
				} else {
					log.warning(err)
				}

				redisClient.end();

			});
		})
	});
});