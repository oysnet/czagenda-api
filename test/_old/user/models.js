var vows = require('vows'), assert = require('assert'), User = require('../../models/user').User;

var couchdb = require('../../libs/couchdb.js');

var validatorEnvironment = require('../../libs/schemas/validator').validatorEnvironment;

var user_data_1 = {
	first_name : 'first_name_1',
	last_name : 'last_name_1',
	email : 'email1@anywhere.net',
	password : 'clear_password1'
};

var user_data_2 = {
	first_name : 'first_name_2',
	last_name : 'last_name_2',
	email : 'email2@anywhere.net',
	password : 'clear_password2'
};

var user_data_3 = {
	first_name : 'first_name_3',
	last_name : 'last_name_3',
	email : 'email3@anywhere.net',
	password : 'clear_password3'
};

var user_data_4 = {
	first_name : 'first_name_4',
	last_name : 'last_name_4',
	email : 'email4@anywhere.net',
	password : 'clear_password4'
};

vows.describe('Test user models').addBatch({

	' ' : {

		topic : function() {
			validatorEnvironment.load(this.callback);
		},
		'validator loaded without error' : function(err, res) {
			assert.isNull(err);
		},
		'create user' : {

			topic : new User,

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

		'delete user' : {
			topic : function() {
				var a = new User();

				for(var key in user_data_1) {
					a[key] = user_data_1[key];
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
						User.get({
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
		'load not existing user' : {
			topic : function() {
				var self = this;
				User.get({
					id : 'DoesNotExist'
				}, function(err, obj) {
					self.callback(err, obj);
				});
			},
			'return error' : function(err, obj) {
				assert.isNotNull(err);
			},
		},
		'load existing user' : {
			topic : function() {

				var a = new User();

				for(var key in user_data_2) {
					a[key] = user_data_2[key];
				}

				var self = this;
				a.save(function(err, obj) {
					self.callback(err, obj);
				})
			},
			'setup completes without errors' : function(err, obj) {
				assert.isNull(err);
			},
			'load user' : {
				topic : function(created_obj) {
					var self = this;
					User.get({
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
				'has same first_name as created' : function(err, obj, created_obj) {
					assert.equal(obj.first_name, created_obj.first_name);
				},
				'has same last_name as created' : function(err, obj, created_obj) {
					assert.equal(obj.last_name, created_obj.last_name);
				},
				'has same email as created' : function(err, obj, created_obj) {
					assert.equal(obj.email, created_obj.email);
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
			'create user' : {
				topic : function(uuid) {
					var a = new User();

					for(var key in user_data_3) {
						a[key] = user_data_3[key];
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
			topic : new User,

			'save invalid user throw an error' : function(m) {
				var a = new User();

				assert.throws(function() {
					a.save();
				}, Error);
			},
			'save invalid user populate errors attribute' : function(m) {
				var m = new User();

				try {
					m.save();
				} catch ( e) {
					assert.ok(m.validationErrors !== null && m.validationErrors.length > 0);
				}
			},
			'after saving' : {
				topic : function(m) {
					var a = new User();

					for(var key in user_data_4) {
						a[key] = user_data_4[key];
					}
					a.save(this.callback);
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
				'object has is_active false' : function(err, m) {
					assert.equal(m.is_active, false);
				},
				'object has is_staff false' : function(err, m) {
					assert.equal(m.is_staff, false);
				},
				'object has a hash' : function(err, m) {
					/*
					 c = require('crypto')
					 h = c.createHash('md5')
					 h.update('user');
					 h.update('email4@anywhere.net')
					 h.digest('hex')
					 */
					assert.strictEqual(m.__data.hash, 'b05bb182e1461474d2ef55505d707706');
				},
				'avoid duplicate' : {
					topic : function() {
						var a = new User();
						for(var key in user_data_4) {
							a[key] = user_data_4[key];
						}
						a.save(this.callback);
					},
					'has an error' : function(err, m) {
						assert.isNotNull(err);
					}
				}

			}
		}
	}

}).export(module);
