var redis = require('../libs/redis-client');
var redisClient = redis.redisClient;
var async = require('async');
var Rest = require('../libs/rest-client-classic').Rest;
var settings = require('../settings');
var urls = {}; //['/schema/base-abstract', '/schema/geo', '/schema/localization', '/schema/who', '/schema/event'];
var log = require('czagenda-log').from(__filename);
var methods = [];
var users = {};
var recordsProcessed = 0;

var populateRedisQueue = function(cb, err, res, data) {



    var data = JSON.parse(data),
      dumps = [];

    recordsProcessed += data.hits.hits.length;

    log.notice('data fetched from elastic', recordsProcessed)

    for(var i = 0, l = data.hits.hits.length; i < l; i++) {
      var d = data.hits.hits[i];

      //log.debug('found url ' + d._id)
      urls[d._id] = null;
      //urls.push(null);
      if(d._type === 'user') {

        methods.push(function(d, callback) {

          redisClient.hmset(redis.USER_PREFIX + d._id, "isActive", d._source.isActive, "isStaff", d._source.isStaff, "isSuperuser", d._source.isSuperuser, function(err, nb) {

            if(err !== null) {
              log.critical(redis.USER_PREFIX + d._id, "isActive", d._source.isActive, "isStaff", d._source.isStaff, "isSuperuser", d._source.isSuperuser)
            }

            log.debug('added to ' + redis.USER_PREFIX + d._id)

            callback(err);
          });
        }.bind(this, d))

      } else if(d._type === 'membership') {

        if(typeof(users[d._source.user]) === 'undefined') {
          users[d._source.user] = [];
        }
        users[d._source.user].push({
          group: d._source.group,
          id: d._id
        });

      } else if(d._type === 'schema') {

        log.debug('found schema url')

        if(d._source.status === 'APPROVED') {
          methods.push(function(id, callback) {

            redisClient.sadd(redis.SCHEMA_APPROVED, id, function(err, nb) {

              log.debug('added to ' + redis.SCHEMA_APPROVED + ' ' + id)

              callback(err);
            });
          }.bind(this, d._id))
        } else if(d._source.status === 'PROPOSAL') {
          methods.push(function(id, author, callback) {

            redisClient.sadd(redis.PREFIX_SCHEMA_PROPOSAL + author, id, function(err, nb) {

              log.debug('added to ' + redis.PREFIX_SCHEMA_PROPOSAL + author + ' ' + id)

              callback(err);
            });
          }.bind(this, d._id, d._source.author))
        }

      }
    }


    cb(err);
  }

var populateAsync = function(cb) {

    log.notice('populateAsync start', settings.elasticsearch.hosts[0].host, settings.elasticsearch.hosts[0].port, settings.elasticsearch.index)

    var rest = new Rest(settings.elasticsearch.hosts[0].host, settings.elasticsearch.hosts[0].port);

    var fetchDataMethods = [];

    rest.post('/' + settings.elasticsearch.index + '/_search', JSON.stringify({
      size: 1
    }), function(err, res, data) {
      var data = JSON.parse(data);
      var count = data.hits.total;
      var from = 0;

      fetchDataMethods.push(function(from, callback) {
        rest.post('/' + settings.elasticsearch.index + '/_search', JSON.stringify({
          size: 10000,
          from: from
        }), populateRedisQueue.bind(this, callback));
      }.bind(this, from));


      while(from <= count) {
        from += 10000;
        fetchDataMethods.push(function(from, callback) {
          rest.post('/' + settings.elasticsearch.index + '/_search', JSON.stringify({
            size: 10000,
            from: from
          }), populateRedisQueue.bind(this, callback));
        }.bind(this, from));
      }
      async.series(fetchDataMethods, function(err, res) {

        if(typeof(err) !== 'undefined' && err !== null) {
          cb(err);
          return
        }

        // Add user groups
        for(k in users) {

          methods.push(function(user, memberships, callback) {

            var multi = redisClient.multi();

            memberships.forEach(function(v) {
              multi.sadd(redis.USER_GROUP_PREFIX + user, v.group);
              log.debug("membership sadd ", redis.USER_GROUP_PREFIX + user, v.group)
              multi.sadd(redis.USER_MEMBERSHIP_PREFIX + user, v.id);
              log.debug("membership sadd ", redis.USER_MEMBERSHIP_PREFIX + user, v.id)
            });

            multi.exec(function(err) {

              if(err !== null) {
                log.critical("Error when restoring USER_GROUP_PREFIX", user, groups.join(' ,'));
              }

              callback(err);
            })


          }.bind(this, k, users[k]))
        }

        _urls = []
        for(k in urls) {

          _urls.push(k);
          _urls.push(null);

          if(_urls.length > 500) {
            methods.push(function(_urls, callback) {

              _urls.push(function(err, nb) {

                if(typeof(err) !== 'undefined') {
                  callback(err);
                  return;
                }

                if(nb !== 1) {
                  err = 'not all urls were added';
                  callback(err);
                  return;
                }
                log.debug('urls added', nb)

                callback(null);
              });

              log.debug('add urls', _urls.length)
              redisClient.msetnx.apply(redisClient, _urls);
            }.bind(this, _urls))
            _urls = []
          }
        }
        if(_urls.length > 0) {
            methods.push(function(_urls, callback) {

              _urls.push(function(err, nb) {

                if(typeof(err) !== 'undefined') {
                  callback(err);
                  return;
                }

                if(nb !== 1) {
                  err = 'not all urls were added';
                  callback(err);
                  return;
                }
                log.debug('urls added', nb)

                callback(null);
              });

              log.debug('add urls', _urls.length)
              redisClient.msetnx.apply(redisClient, _urls);
            }.bind(this, _urls))
          }


        cb(err)

      })


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

      if(typeof(err) !== 'undefined' && err !== null) {
        console.error(err);
        redisClient.end();
        return;
      }

      async.series(methods, function(err) {

        if(typeof(err) !== 'undefined' && err !== null) {
          log.warning(err)
        } else {
          log.notice('all done')

        }

        redisClient.end();

      });
    })
  });
});