var vows = require('vows'), assert = require('assert'), Schema = require('../../models/schema').Schema;

var couchdb = require('../../libs/couchdb.js');

var validatorEnvironment = require('../../libs/schemas/validator').validatorEnvironment;

vows.describe('Test schema models').addBatch({

	' ' : {

		topic : function() {
			validatorEnvironment.load(this.callback);
		},
		'validator loaded without error' : function(err, res) {
			assert.isNull(err);
		},
		'create schema' : {

			topic : new Schema,

			'id is null' : function(m) {
				assert.isNull(m.id);
			},
			'rev is null' : function(m) {
				assert.isNull(m.rev);
			},
			'__data is empty object' : function(m) {
				assert.deepEqual(m.__data, {});
			}
		},

		'delete schema' : {
			topic : function() {
				var a = new Schema();
				a.schema = {
					'att1' : 1
				}
				var self = this;
				a.save(function(err, obj) {
					self.callback(err, obj);
				})
			},
			'setup completes without errors' : function(err, obj) {
				assert.isNull(err);
			},
			'delete' : {
				topic : function(created_obj) {
					var self = this;
					var callback = function(err) {
						self.callback(err, created_obj);
					}
					created_obj.del(callback);
				},
				'delete without errors' : function(err, obj) {
					assert.isNull(err);
				},
				'is deleted' : {
					topic : function(object) {
						var self = this;
						Schema.get({
							id : object.id
						}, function(err, obj) {
							self.callback(err, obj);
						});
					},
					'get return error' : function(err, obj) {
						assert.isNotNull(err);
					}
				}
			},

		},
		'load not existing schema' : {
			topic : function() {
				var self = this;
				Schema.get({
					id : 'DoesNotExist'
				}, function(err, obj) {
					self.callback(err, obj);
				});
			},
			'return error' : function(err, obj) {
				assert.isNotNull(err);
			},
		},
		'load existing schema' : {
			topic : function() {

				var a = new Schema();
				a.schema = {
					'att1' : 1
				}
				var self = this;
				a.save(function(err, obj) {
					self.callback(err, obj);
				})
			},
			'setup completes without errors' : function(err, obj) {
				assert.isNull(err);
			},
			'load schema' : {
				topic : function(created_obj) {
					var self = this;
					Schema.get({
						id : created_obj.id
					}, function(err, obj) {
						self.callback(err, obj, created_obj);
					});
				},
				'no error' : function(err, obj) {
					assert.isNull(err);
				},
				'has same id as created' : function(err, obj, created_obj) {
					assert.equal(obj.id, created_obj.id);
				},
				'has same rev as created' : function(err, obj, created_obj) {
					assert.equal(obj.rev, created_obj.rev);
				},
				'has same schema attributes as created' : function(err, obj, created_obj) {
					assert.deepEqual(obj.schema, created_obj.schema);
				}
			}

		},

		'save new schema with manual id' : {
			topic : function() {
				couchdb.uuids.get(this.callback)
			},
			'setup completes without errors' : function(err, uuid) {
				assert.isNull(err);
			},
			'check uuid' : function(err, uuid) {
				assert.ok( typeof (uuid) === 'string');
			},
			'create schema' : {
				topic : function(uuid) {
					var a = new Schema();
					a.schema = {
						'att01' : 1
					}
					a.id = uuid;
					var self = this;
					a.save(function(err, obj) {
						self.callback(err, obj, uuid);
					});
				},
				'setup completes without errors' : function(err, obj, uuid) {
					assert.isNull(err);
				},
				'check object\'s id' : function(err, obj, uuid) {
					assert.equal(obj.id, uuid);
				},
			}

		},

		'save new schema' : {
			topic : new Schema,
			'should not save empty schema' : function(m) {
				assert.throws(function() {
					m.save();
				}, Error);
			},
			'save invalid schema throw an error' : function(m) {
				var m = new Schema();
				m.schema = {
					id : 3
				}
				assert.throws(function() {
					m.save();
				}, Error);
			},
			'save invalid schema populate errors attribute' : function(m) {
				var m = new Schema();
				m.schema = {
					id : 3
				}
				try {
					m.save();
				} catch ( e) {
					assert.ok(m.validationErrors !== null && m.validationErrors.length > 0);
				}
			},
			'after saving' : {
				topic : function(m) {
					var m = new Schema();
					m.template = 'template 1'
					m.sample = 'sample 1'
					m.schema = {};
					m.save(this.callback);
				},
				'return no error' : function(err, m) {
					assert.isNull(err);
				},
				'return the object' : function(err, m) {
					assert.isNotNull(m);
				},
				'object has an id' : function(err, m) {
					assert.ok( typeof (m.id) === 'string' && m.id.length > 0);
				},
				'object has a rev' : function(err, m) {
					assert.isNotNull(m.rev);
				},
				'object revision is first' : function(err, m) {
					assert.strictEqual(m.rev.slice(0, 2), '1-');
				},
				'object has status pending' : function(err, m) {
					assert.equal(m.status, 'PENDING');
				},
				'object has final false' : function(err, m) {
					assert.equal(m.final, false);
				},
				'object has sample' : function(err, m) {
					assert.equal(m.sample, 'sample 1');
				},
				'object has template' : function(err, m) {
					assert.equal(m.template, 'template 1');
				},
				'object has a hash' : function(err, m) {
					/*
					 c = require('crypto')
					 h = c.createHash('md5')
					 h.update('schema');
					 h.update(JSON.stringify({}))
					 h.digest('hex')
					 */
					assert.strictEqual(m.__data.hash, 'fa75d57936e89ec735d6d21051d61a45');
				},
				'avoid duplicate' : {
					topic : function() {
						var m2 = new Schema();
						m2.schema = {};
						m2.save(this.callback);
					},
					'has an error' : function(err, m) {
						assert.isNotNull(err);
					}
				}

			}
		}
	}

}).export(module);
