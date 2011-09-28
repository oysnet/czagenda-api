var vows = require('vows');
var assert = require('assert');
var Rest = require('../../libs/rest.js').Rest;
var User = require('../../models/user').User;
var statusCode = require('../../libs/statusCodes.js');
var settings = require('../../settings.js');
var CouchClient = require('couch-client');

var validatorEnvironment = require('../../libs/schemas/validator').validatorEnvironment;

var user_data1 = {
	first_name : 'first_name_11',
	last_name : 'last_name_11',
	email : 'email11@anywhere.net',
	password : 'clear_password11'
};

var user_data2 = {
	first_name : 'first_name_12',
	last_name : 'last_name_12',
	email : 'email12@anywhere.net',
	password : 'clear_password12'
};

var user_data3 = {
	first_name : 'first_name_13',
	last_name : 'last_name_13',
	email : 'email13_is_invalid',
	password : 'clear_password13'
};

var user_data4 = {
	first_name : 'first_name_14',
	last_name : 'last_name_14',
	email : 'email14@anywhere.net',
	password : 'clear_password14'
};


var user_data5 = {
	first_name : 'first_name_15',
	last_name : 'last_name_15',
	email : 'email15@anywhere.net',
	password : 'clear_password15'
};


var user_data6 = {
	first_name : 'first_name_16',
	last_name : 'last_name_16',
	email : 'email16@anywhere.net',
	password : 'clear_password16'
};

vows.describe('Test user rpcs').addBatch({

	' ' : {

		topic : function() {
			validatorEnvironment.load(this.callback);
		},
		'validator loaded without error' : function(err, res) {
			assert.isNull(err);
		},
		'rest get user not found' : {

			topic : function() {
				rest = new Rest();
				rest.get('/user/ThisIdDoesNotExist', this.callback)
			},
			'statusCode is 404' : function(err, res, data) {
				assert.equal(res.statusCode, statusCode.NOT_FOUND);
			}
		},

		'rest get user' : {

			topic : function() {
				var a = new User();

				for(k in user_data1) {
					a[k] = user_data1[k]
				}

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
					rest.get('/user/' + created_obj.id, this.callback)
				},
				'statusCode is 200' : function(err, res, data) {
					assert.equal(res.statusCode, statusCode.ALL_OK);
				},
				'check body' : function(err, res, data) {
					assert.ok(JSON.parse(data).first_name === user_data1.first_name && JSON.parse(data).last_name === user_data1.last_name && JSON.parse(data).email === user_data1.email);
				}
			}

		},

		'rest create user' : {
			topic : function() {
				rest = new Rest();
				rest.post('/user', JSON.stringify(user_data2), this.callback);
			},
			'statusCode is 201' : function(err, res, data) {
				assert.equal(res.statusCode, statusCode.CREATED);
			},
			'check body' : function(err, res, data) {
				var data = JSON.parse(data);
				assert.ok(data.first_name === user_data2.first_name && data.last_name === user_data2.last_name && data.email === user_data2.email);
			},
			'check id' : function(err, res, data) {
				assert.ok( typeof (JSON.parse(data).id) == 'string' && JSON.parse(data).id.length > 0);
			},
			'duplicate entry' : {

				topic : function() {
					rest = new Rest();
					rest.post('/user', JSON.stringify(user_data2), this.callback)
				},
				'statusCode is 409' : function(err, res, data) {
					assert.equal(res.statusCode, statusCode.DUPLICATE_ENTRY);
				},
			}
		},

		'rest create invalid user' : {
			topic : function() {
				var self = this;
				rest = new Rest();
				rest.post('/user', JSON.stringify(user_data3), this.callback);
			},
			'statusCode is 400' : function(err, res, data) {
				assert.equal(res.statusCode, statusCode.BAD_REQUEST);
			},
			'check body' : function(err, res, data) {
				var report = JSON.parse(data);
				assert.ok(report.length >= 1);
			}
		},

		'rest delete user' : {
			topic : function() {
				var a = new User();

				for(k in user_data4) {
					a[k] = user_data4[k]
				}

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
					rest.del('/user/' + created_obj.id, this.callback);
				},
				'statusCode is 204' : function(err, res, data) {
					assert.equal(res.statusCode, statusCode.DELETED);
				}
			}

		},

		'rest edit user' : {
			topic : function() {
				var a = new User();

				for(k in user_data5) {
					a[k] = user_data5[k]
				}

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

					user_data5.last_name += ' UPDATED';
					rest = new Rest();
					rest.put('/user/' + created_obj.id, JSON.stringify(user_data5), function(err, res, data) {
						self.callback(err, res, data, created_obj)
					});
				},
				'statusCode is 200' : function(err, res, data) {
					assert.equal(res.statusCode, statusCode.ALL_OK);
				},
				'check body' : function(err, res, data) {
					assert.equal(JSON.parse(data).last_name, user_data5.last_name);
				}
			}

		},

		'rest edit invalid user' : {
			topic : function() {
				var a = new User();
				
				for(k in user_data6) {
					a[k] = user_data6[k]
				}
				
				var self = this;
				a.save(function(err, obj) {
					self.callback(err, obj);
				})
			},
			'setup completes without errors' : function(err, obj) {
				assert.isNull(err);
			},
			"invalidate user" : {
				topic : function(created_obj) {
					var self = this;

					created_obj.email = 'invalid_email';
					rest = new Rest();
					rest.put('/user/' + created_obj.id, JSON.stringify(created_obj), function(err, res, data) {
						self.callback(err, res, data, created_obj)
					});
				},
				'statusCode is 400' : function(err, res, data) {
					assert.equal(res.statusCode, statusCode.BAD_REQUEST);
				},
				'check body' : function(err, res, data) {
					var report = JSON.parse(data);
					assert.ok(report.length === 1 );
				}
			}

		},

		'rest list user' : {
			topic : function() {
				var rest = new Rest();
				rest.get('/user', this.callback);
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
					rest.get('/user?limit=2', this.callback);
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
