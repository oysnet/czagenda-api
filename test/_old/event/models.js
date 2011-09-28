var vows = require('vows'), assert = require('assert'), Event = require('../../models/event').Event;

var couchdb = require('../../libs/couchdb.js');

var validatorEnvironment = require('../../libs/schemas/validator').validatorEnvironment;

vows.describe('Test event models').addBatch({

	' ' : {

		topic : function() {
			validatorEnvironment.load(this.callback);
		},
		'validator loaded without error' : function(err, res) {
			assert.isNull(err);
		},
		'create event' : {

			topic : new Event,

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

		'delete event' : {
			topic : function() {
				var a = new Event();
				a.event = {
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
						Event.get({
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
		'load not existing event' : {
			topic : function() {
				var self = this;
				Event.get({
					id : 'DoesNotExist'
				}, function(err, obj) {
					self.callback(err, obj);
				});
			},
			'return error' : function(err, obj) {
				assert.isNotNull(err);
			},
		},
		'load existing event' : {
			topic : function() {

				var a = new Event();
				a.event = {
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
			'load event' : {
				topic : function(created_obj) {
					var self = this;
					Event.get({
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
					assert.deepEqual(obj.event, created_obj.event);
				}
			}

		},

		'save new event with manual id' : {
			topic : function() {
				couchdb.uuids.get(this.callback)
			},
			'setup completes without errors' : function(err, uuid) {
				assert.isNull(err);
			},
			'check uuid' : function(err, uuid) {
				assert.ok( typeof (uuid) === 'string');
			},
			'create event' : {
				topic : function(uuid) {
					var a = new Event();
					a.event = {
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

		'save new event' : {
			topic : new Event,
			'should not save empty event' : function(m) {
				assert.throws(function() {
					m.save();
				}, Error);
			},
			/*'save invalid event throw an error' : function(m) {
			 var m = new Event();
			 m.event = {id : 3}
			 assert.throws(function () {
			 m.save();
			 },Error);
			 },
			 'save invalid event populate errors attribute' : function(m) {
			 var m = new Event();
			 m.event = {id : 3}
			 try {
			 m.save();
			 } catch ( e) {
			 assert.ok(m.validationErrors !== null && m.validationErrors.length > 0);
			 }
			 },*/
			'after saving' : {
				topic : function(m) {
					var m = new Event();
					m.author = '/user/AuthorId'
					m.write_groups = ['/user/Group1']
					m.read_groups = ['/user/Group1']
					m.write_users = ['/user/User1']
					m.read_users = ['/user/User1']

					m.event = {};
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
				'object has author' : function(err, m) {
					assert.equal(m.author, '/user/AuthorId');
				},
				'object has write_groups' : function(err, m) {
					assert.deepEqual(m.write_groups, ['/user/Group1']);
				},
				'object has read_groups' : function(err, m) {
					assert.deepEqual(m.read_groups, ['/user/Group1']);
				},
				'object has write_users' : function(err, m) {
					assert.deepEqual(m.write_users, ['/user/User1']);
				},
				'object has read_users' : function(err, m) {
					assert.deepEqual(m.read_users, ['/user/User1']);
				},
				'object has a hash' : function(err, m) {
					/*
					 c = require('crypto')
					 h = c.createHash('md5')
					 h.update('event');
					 h.update(JSON.stringify({}))
					 h.digest('hex')
					 */
					assert.strictEqual(m.__data.hash, '5ad86fca89bb3a62ac125eb4945bf7b1');
				},
				'avoid duplicate' : {
					topic : function() {
						var m2 = new Event();
						m2.event = {};
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
