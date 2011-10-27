var JSV = require('JSV').JSV
var settings = require('../../settings.js');
var models = require('../../models');
var log = require('czagenda-log').from(__filename);
var redis = require('../redis-client');
var async = require('async');

var ValidatorEnvironment = function() {

	var env = JSV.createEnvironment("json-schema-draft-03");
	this.env = env;
}

ValidatorEnvironment.prototype.env = null;

/**
 * Public method that request environement to be loaded with optionnaly user proposal schemas
 */
ValidatorEnvironment.prototype.load = function(callback, user) {
	
	 log.notice('Fetching schemas id from redis');

	 var keys = [redis.SCHEMA_APPROVED];

	 if( typeof (user) !== 'undefined') {
	 keys.push(redis.PREFIX_SCHEMA_PROPOSAL + user);
	 }

	 keys.push( function(err, res) {
	 if(err !== null) {
	 log.critical('Fail to fetch schemas id from redis', err);
	 callback(err);
	 return;
	 }

	 log.debug('Schemas id fetched from redis', res);
	 this._loadFromDB(res, callback);

	 }.bind(this));

	 redis.redisClient.sunion.apply(redis.redisClient, keys)
	 
	/*
	var fs = require('fs');
	var SCHEMAS = [{
		"name" : "/schema/base-abstract",
		"final" : false,
		"file" : "base.json"
	}, {
		"name" : "/schema/who",
		"final" : true,
		"file" : "who.json"
	}, {
		"name" : "/schema/geo",
		"final" : true,
		"file" : "geo.json"
	}, {
		"name" : "/schema/localization",
		"final" : true,
		"file" : "localization.json"
	}, {
		"name" : "/schema/event-abstract",
		"final" : true,
		"file" : "event-abstract.json"
	}, {
		"name" : "/schema/event",
		"final" : true,
		"file" : "event.json"
	}, {
		"name" : "/schema/entity-abstract",
		"final" : false,
		"file" : "entity.json"
	}, {
		"name" : "/schema/organization-abstract",
		"final" : false,
		"file" : "organization-abstract.json"
	}, {
		"name" : "/schema/organization",
		"final" : true,
		"file" : "organization.json"
	}, {
		"name" : "/schema/person-abstract",
		"final" : false,
		"file" : "person-abstract.json"
	}, {
		"name" : "/schema/person",
		"final" : true,
		"file" : "person.json"
	}]

	SCHEMAS.forEach(function(schema) {
		console.log(schema.name)
		this.env.createSchema(JSON.parse(fs.readFileSync("./schemas/" + schema.file, 'utf8')), undefined, schema.name);
	}.bind(this));
	
	callback(null);*/
}
/**
 * Public method that return validator environement
 */
ValidatorEnvironment.prototype.getEnv = function() {
	return this.env;
}
/**
 * Load schemas from elastic
 */
ValidatorEnvironment.prototype._loadFromDB = function(schemas, callback) {
	var asyncMethods = [];
	for(var i = 0, l = schemas.length; i < l; i++) {
		asyncMethods.push( function(i, cb) {
			
			models.Schema.get({
				id : schemas[i]
			}, function(err, obj) {

				if(err !== null) {
					cb(err)
				} else {
					cb(null, obj);
				}
			});
		}.bind(this, i));
	}

	async.parallel(asyncMethods, function(err, schemas) {

		if(err !== null && typeof (err) !== 'undefined') {
			log.critical('Fail to fetch schemas from db', err);
			callback(new Error('Fail to fetch schemas from db'));
			return;
		}

		if(schemas.length === 0) {
			log.warning('No schemas to add to validator environment');
			callback(null);
			return;
		}
		
		/*
		// try to add schemas
		while(schemas.length > 0) {
			var tmp = this._addSchemasToEnv(schemas, this.env);
			if(tmp.length === 0) {
				log.notice('Schemas loaded');
				callback(null, true)
				break;
			} else if(tmp.length === schemas.length) {
				log.critical('Fail to add schemas to validator environment', tmp);
				callback(new Error('Fail to add schemas to validator environment'));
				break;
			} else {
				schemas = tmp;
			}
		}*/
		
		if (this._addSchemasToEnv(schemas) === true) {
			callback(null, true);
		} else {
			callback(new Error('Fail to add schemas to validator environment'));
		}
		
	}.bind(this));

}

var crypto = require('crypto');
function hash(data) {
	h = crypto.createHash('md5')
	
	h.update(JSON.stringify(data))
	return h.digest('hex')
}

/**
 * Try to add schemas to validator environment
 */
ValidatorEnvironment.prototype._addSchemasToEnv = function(schemas) {
	
	/*
	var hashes = {}
	
	var d = {};

	schemas.forEach(function(schema) {
		d[schema.id] = schema
		
	});
	var env = JSV.createEnvironment("json-schema-draft-03");
	[ '/schema/geo-abstract',
  '/schema/base-abstract',
  '/schema/who-abstract',
  '/schema/geo',
  '/schema/localization-abstract',
  '/schema/who',
  '/schema/localization',
  //'/schema/entity-abstract',
  '/schema/event-abstract',
  //'/schema/organization-abstract',
  //'/schema/person-abstract',
  '/schema/event',
  //'/schema/organization',
  //'/schema/person'
   ].forEach(function (id) {
  	
  	var schema = d[id];
  	env.createSchema(schema.schema, undefined, id);
  	
  	hashes[id] = {"hash" : hash(schema.schema), 'data' : schema.schema};
  	
  	console.log(id)
  });
  
	
	this.env = env;
	return true;
	
	throw new Error('ja dois pas passer la')
	
var SCHEMAS = [{
	"name" : "base",
	"final" : false,
	"file" : "base-abstract.json"
},  {
	"name" : "geo",
	"final" : false,
	"file" : "geo-abstract.json"
}, {
	"name" : "geo",
	"final" : true,
	"file" : "geo.json"
},{
	"name" : "localization",
	"final" : false,
	"file" : "localization-abstract.json"
}, {
	"name" : "localization",
	"final" : true,
	"file" : "localization.json"
},{
	"name" : "entity",
	"final" : false,
	"file" : "entity-abstract.json"
},{
	"name" : "who",
	"final" : false,
	"file" : "who-abstract.json"
}, {
	"name" : "who",
	"final" : true,
	"file" : "who.json"
},  {
	"name" : "event",
	"final" : false,
	"file" : "event-abstract.json"
}, {
	"name" : "event",
	"final" : true,
	"file" : "event.json"
},  {
	"name" : "organization",
	"final" : false,
	"file" : "organization-abstract.json"
}, {
	"name" : "organization",
	"final" : true,
	"file" : "organization.json"
}, {
	"name" : "person",
	"final" : false,
	"file" : "person-abstract.json"
}, {
	"name" : "person",
	"final" : true,
	"file" : "person.json"
}]
//var env = JSV.createEnvironment("json-schema-draft-03");
var d = {};

SCHEMAS.forEach(function(schema) {
	var name = '/schema/' + schema.name + (schema['final'] === false ? '-abstract':'');
	d[name] = schema
	
});

var fs = require('fs');
[ '/schema/geo-abstract',
  '/schema/base-abstract',
  '/schema/who-abstract',
  '/schema/geo',
  '/schema/localization-abstract',
  '/schema/who',
  '/schema/localization',
  '/schema/entity-abstract',
  '/schema/event-abstract',
  '/schema/organization-abstract',
  '/schema/person-abstract',
  '/schema/event',
  '/schema/organization',
  '/schema/person' ].forEach(function (id) {
  	
  	var schema = d[id];
  	//env.createSchema(JSON.parse(fs.readFileSync("./schemas/" + schema.file, 'utf8')), undefined, id);
  	
  	var data = JSON.parse(fs.readFileSync("./schemas/" + schema.file, 'utf8'))
  	_hash =  hash(data);
  	if (hashes[id].hash !== _hash) {
  		console.log('hash not match', id, hashes[id].hash, _hash)
  		
  		console.log(JSON.stringify(data))
  		console.log(JSON.stringify(hashes[id].data))
  		
  		//throw new Error()
  	}
  	
  	console.log(id)
  });
	
	this.env = env;
	return true;
	
	throw new Error('ja dois pas passer la')
	*/
	
	var ordered = [];
	var expected = schemas.length;
	
	
	var env = null;
	var failedCount = 0;
	
	while (failedCount < schemas.length && expected > ordered.length) {
		
		env = JSV.createEnvironment("json-schema-draft-03");
		
		for (var i =0, l = ordered.length; i<l;i++) {
			
			try{
				env.createSchema(ordered[i].schema, undefined, ordered[i].id);
			} catch (e) {
				log.critical("_addSchemasToEnv: Schema that succeed, fail now !", ordered[i].id);
				return false;
			}
		}
		
		for(var i = 0, l = schemas.length; i < l; i++) {
			try {
				
				env.createSchema(schemas[i].schema, undefined, schemas[i].id);
				ordered.push(schemas[i]);
			} catch (e) {
				
				// delete all schema in schemas that succeed
				schemas.splice(0,i);
				
				// move schema that at the end of schemas array
				schemas.push(schemas.shift());
				
				if (i === 0) {
					failedCount++;
				} else {
					failedCount = 0;
				}
				break;
			}
		}
		
	}
	
	if (ordered.length === expected) {
		this.env = env;
		
		var tmp = [];
		ordered.forEach(function (v) {
			tmp.push(v.id);
		})
		console.log(tmp)
		return true;
	}
	
	return false;
	

}

exports.approvedEnvironment = new ValidatorEnvironment();
exports.ValidatorEnvironment = ValidatorEnvironment;
