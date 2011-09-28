var vows = require('vows');
var assert = require('assert');
var Rest = require('../../libs/rest.js').Rest;
var Schema = require('../../models/schema').Schema;
var statusCode = require('../../libs/statusCodes.js');
var settings = require('../../settings.js');
var CouchClient = require('couch-client');

var validatorEnvironment = require('../../libs/schemas/validator').validatorEnvironment;

var schema1 = {
	'att01' : 1
};
var schema2 = {
	'att02' : 1
};
var schema3 = {
	'att03' : 1
};
var schema4 = {
	'att04' : 1,
	id : '/schema/4'
};
var schema5 = {
	id : true
};
var schema6 = {
	id : 'http://nowhere.schema.org/schema'
};

vows.describe('Test rpcs').addBatch({
	' ' : {

		topic : function() {
			validatorEnvironment.load(this.callback);
		},
		'validator loaded without error' : function(err, res) {
			assert.isNull(err);
		},
		'rest get schema not found' : {

			topic : function() {
				rest = new Rest();
				rest.get('/schema/ThisIdDoesNotExist', this.callback)
			},
			'statusCode is 404' : function(err, res, data) {
				assert.equal(res.statusCode, statusCode.NOT_FOUND);
			}
		},

		'rest get schema' : {

			topic : function() {
				var a = new Schema();
				a.schema = schema1;
				var self = this;
				a.save(function(err, obj) {
					self.callback(err, obj);
				})
			},
			'setup completes without errors' : function(err, obj) {
				assert.isNull(err);
			},
			'check response' : {
				topic : function(created_obj) {
					rest = new Rest();
					rest.get('/schema/' + created_obj.id, this.callback)
				},
				'statusCode is 200' : function(err, res, data) {
					assert.equal(res.statusCode, statusCode.ALL_OK);
				},
				'check body' : function(err, res, data) {
					assert.deepEqual(JSON.parse(data), schema1);
				}
			}

		},

		'rest create schema' : {
			topic : function() {
				rest = new Rest();
				rest.post('/schema', JSON.stringify(schema2), this.callback);
			},
			'statusCode is 201' : function(err, res, data) {
				assert.equal(res.statusCode, statusCode.CREATED);
			},
			'check body' : function(err, res, data) {
				var o = JSON.parse(data);
				delete o.id;
				assert.deepEqual(o, schema2);
			},
			'check id' : function(err, res, data) {
				assert.ok( typeof (JSON.parse(data).id) == 'string' && JSON.parse(data).id.length > 0);
			},
			'duplicate entry' : {

				topic : function() {
					rest = new Rest();
					rest.post('/schema', JSON.stringify(schema2), this.callback)
				},
				'statusCode is 409' : function(err, res, data) {
					assert.equal(res.statusCode, statusCode.DUPLICATE_ENTRY);
				},
			}
		},

		'rest create invalid schema' : {
			topic : function() {
				var self = this;
				rest = new Rest();
				rest.post('/schema', JSON.stringify(schema5), this.callback);
			},
			'statusCode is 400' : function(err, res, data) {
				assert.equal(res.statusCode, statusCode.BAD_REQUEST);
			},
			'check body' : function(err, res, data) {
				var report = JSON.parse(data);
				assert.ok(report.length === 1 && report[0].schemaUri === 'http://json-schema.org/draft-03/schema#/properties/id' && report[0].attribute === 'type' && report[0].details[0] == 'string');
			}
		},

		'rest delete schema' : {
			topic : function() {
				var a = new Schema();
				a.schema = schema3;
				var self = this;
				a.save(function(err, obj) {
					self.callback(err, obj);
				})
			},
			'setup completes without errors' : function(err, obj) {
				assert.isNull(err);
			},
			"delete" : {
				topic : function(created_obj) {
					rest = new Rest();
					rest.del('/schema/' + created_obj.id, this.callback);
				},
				'statusCode is 204' : function(err, res, data) {
					assert.equal(res.statusCode, statusCode.DELETED);
				}
			}

		},

		'rest edit schema' : {
			topic : function() {
				var a = new Schema();
				a.id = '4'
				a.schema = schema4;
				var self = this;
				a.save(function(err, obj) {
					self.callback(err, obj);
				})
			},
			'setup completes without errors' : function(err, obj) {
				assert.isNull(err);
			},
			"update" : {
				topic : function(created_obj) {
					var self = this;

					schema4.att04 = 2;
					rest = new Rest();
					rest.put('/schema/' + created_obj.id, JSON.stringify(schema4), function(err, res, data) {
						self.callback(err, res, data, created_obj)
					});
				},
				'statusCode is 200' : function(err, res, data) {
					assert.equal(res.statusCode, statusCode.ALL_OK);
				},
				'check body' : function(err, res, data) {
					assert.deepEqual(JSON.parse(data), schema4);
				},
				'check id' : function(err, res, data, created_obj) {
					assert.equal(JSON.parse(data).id, '/schema/4');
				}
			}

		},

		'rest edit invalid schema' : {
			topic : function() {
				var a = new Schema();
				a.schema = schema6;
				var self = this;
				a.save(function(err, obj) {
					self.callback(err, obj);
				})
			},
			'setup completes without errors' : function(err, obj) {
				assert.isNull(err);
			},
			"invalidate schema" : {
				topic : function(created_obj) {
					var self = this;

					created_obj.schema.id = true;
					rest = new Rest();
					rest.put('/schema/' + created_obj.id, JSON.stringify(created_obj.schema), function(err, res, data) {
						self.callback(err, res, data, created_obj)
					});
				},
				'statusCode is 400' : function(err, res, data) {
					assert.equal(res.statusCode, statusCode.BAD_REQUEST);
				},
				'check body' : function(err, res, data) {
					var report = JSON.parse(data);
					assert.ok(report.length === 1 && report[0].schemaUri === 'http://json-schema.org/draft-03/schema#/properties/id' && report[0].attribute === 'type' && report[0].details[0] == 'string');
				}
			}

		},

		'rest list schema' : {
			topic : function() {
				var rest = new Rest();
				rest.get('/schema', this.callback);
			},
			'statusCode is 200' : function(err, res, data) {
				assert.equal(res.statusCode, statusCode.ALL_OK);
			},
			'request complete without errors' : function(err, res, data) {
				assert.ok(err === null && typeof (JSON.parse(data).error) === 'undefined');
			},
			"check total_rows" : function(err, res, data) {
				assert.ok( typeof (JSON.parse(data).total_rows) !== 'undefined');
			},
			"check rows" : function(err, res, data) {
				assert.ok( typeof (JSON.parse(data).rows) !== 'undefined' && JSON.parse(data).rows.length > 0);
			},
			"paginate" : {
				topic : function() {
					var rest = new Rest();
					rest.get('/schema?limit=2', this.callback);
				},
				'statusCode is 200' : function(err, res, data) {
					assert.equal(res.statusCode, statusCode.ALL_OK);
				},
				'request complete without errors' : function(err, res, data) {
					assert.ok(err === null && typeof (JSON.parse(data).error) === 'undefined');
				},
				"check rows" : function(err, res, data) {
					assert.ok( typeof (JSON.parse(data).rows) !== 'undefined' && JSON.parse(data).rows.length === 2);
				}
			}

		}
	}
}).export(module);
