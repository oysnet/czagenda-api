var vows = require('vows');
var assert = require('assert');
var Rest = require('../../libs/rest-client.js').Rest;

var statusCode = require('../../libs/statusCodes.js');
var settings = require('../../settings.js');
var tests_data = require('../tests_data');

var date_re = new RegExp("^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$");
var number_re = new RegExp("^[0-9]+$");
var eventid_re = new RegExp("^\/event\/[a-z0-9]+$");

var data_keys = ['agenda', 'author', 'createDate', 'updateDate', 'writeUsers', 'writeGroups', 'readUsers', 'readGroups', 'id', 'event'].sort();

// CREATION
var create_test_data = {
	event : {
		title : "event title",
		eventStatus : 'confirmed',
		category : "/category/34b74b021369bb23e67f22bad8f1229a",
		links : [{
			rel : "describedby",
			href : "/schema/event"
		}],
		where : [{
			valueString : "Pau"
		}],
		when : [{startTime : '2001-09-12'}]
	}
}

var create_test_data_expected = {
	author : '/user/test',

	event : {
		title : "event title",
		eventStatus : 'confirmed',
		links : [{
			rel : "describedby",
			href : "/schema/event"
		}],
		where : [{
			valueString : "Pau"
		}],
		when : [{startTime : '2001-09-12'}],
		category : "/category/34b74b021369bb23e67f22bad8f1229a"
	},
	agenda : null
}

var create_invalid_test_data = {
	event : {
		title : "even title",
		category : "/category/34b74b021369bb23e67f22bad8f1229a"
	},
}

var create_invalid_test_data_expected = {
	items : {
		'event.links' : ['required']
	},
	errors : []
};

var create_invalid_test_data_2 = {
	event : {
		title : "event that fail to validate against schema",
		links : [{
			rel : "describedby",
			href : "/schema/event"
		}],
		where : [{
			valueString : 2
		}],
		category : "/category/34b74b021369bb23e67f22bad8f1229a"
	}
}

var create_invalid_test_data_expected_2 = {
	items : {
		'/event/where/0/valueString' : ['a string is required'],
		'/event/eventStatus' : ['Property is required'],
		'/event/when' : ['Property is required']
	},
	errors : []
};

var create_invalid_test_data_3 = {
	agenda : "/agenda/ditnotexists",
	event : {
		title : "event title",
		category : "/category/idnotexists",
		links : [{
			rel : "describedby",
			href : "/schema/event"
		}],
		where : [{
			valueString : "Pau"
		}]
	}
}

var create_invalid_test_data_expected_3 = {
	items : {
		'agenda' : ['Object doesn\'t exist'],
		'event.category' : ['Object doesn\'t exist'],
		'/event/eventStatus' : ['Property is required'],
		'/event/when' : ['Property is required']
	},
	errors : []
};

var create_invalid_test_data_4 = {
	event : {
		title : "event that fail to validate because of schema ",
		links : [{
			rel : "describedby",
			href : "/schema/organization"
		}],
		eventStatus : 'confirmed',
		when : [{startTime:'2010-1-02'}],
		category : "/category/34b74b021369bb23e67f22bad8f1229a"
	}
}

var create_invalid_test_data_expected_4 = {
	items : {
		 'event.links': [ 'Link with rel=describedby must be a subschema of /schema/event-abstract' ]
	},
	errors : []
};

var create_invalid_test_data_5 = {
	event : {
		title : "event title fail master 1",
		eventStatus : 'confirmed',
		category : "/category/34b74b021369bb23e67f22bad8f1229a",
		links : [{
			rel : "describedby",
			href : "/schema/event"
		}],
		where : [{
			valueString : "Pau"
		}],
		when : [{startTime : '2001-09-12'}],
		parentEvent : tests_data.event_master_fail_1
	}
}

var create_invalid_test_data_expected_5 = {
	items : {
		 'event.parentSchema': [ 'must define an event.childSchema attribute' ]
	},
	errors : []
};

var create_invalid_test_data_6 = {
	event : {
		title : "event title fail master 1",
		eventStatus : 'confirmed',
		category : "/category/34b74b021369bb23e67f22bad8f1229a",
		links : [{
			rel : "describedby",
			href : "/schema/event"
		}],
		where : [{
			valueString : "Pau"
		}],
		when : [{startTime : '2001-09-12'}],
		parentEvent : tests_data.event_master_fail_2
	}
}

var create_invalid_test_data_expected_6 = {
	items : {
		'event.links': [ 'Link with rel=describedby must be a subschema of /schema/organization' ]
	},
	errors : []
};

// UPDATE
var update_test_data_in_database = tests_data.event_1;

var update_test_data = {
	event : {
		title : 'modified title event',
		eventStatus : 'confirmed',
		links : [{
			rel : "describedby",
			href : "/schema/event"
		}],
		where : [{
			valueString : "Pau"
		}],
		when : [{startTime : '2001-09-12'}],
		category : "/category/34b74b021369bb23e67f22bad8f1229a"
	}
}

var update_test_data_expected = {
	id : tests_data.event_1.id,
	createDate : tests_data.event_1.createDate,
	writeUsers : tests_data.event_1.writeUsers,
	writeGroups : tests_data.event_1.writeGroups,
	readUsers : tests_data.event_1.readUsers,
	readGroups : tests_data.event_1.readGroups,
	author : '/user/login-user-2',
	event : {
		title : 'modified title event',
		links : [{
			rel : "describedby",
			href : "/schema/event"
		}],
		where : [{
			valueString : "Pau"
		}],
		when : [{startTime : '2001-09-12'}],
		category : "/category/34b74b021369bb23e67f22bad8f1229a",
		eventStatus : 'confirmed'
	},
	agenda : null
}

// GET
var get_test_data_in_database = tests_data.event_2;

var delete_test_data_in_database = tests_data.event_3;

vows.describe('Event API exchanged data structure').addBatch({

	'CREATE' : {
		topic : function() {
			rest = new Rest();
			rest.post('/api/event', JSON.stringify(create_test_data), this.callback);
		},
		'check statusCode is 201' : function(err, res, data) {
			assert.equal(res.statusCode, statusCode.CREATED);
		},
		'check createDate' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(date_re.test(data.createDate), true);
		},
		'check updateDate' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(data.createDate, data.updateDate);
		},
		'check writeUsers' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(data.writeUsers, data.id + '/perms/wu');
		},
		'check readUsers' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(data.readUsers, data.id + '/perms/ru');
		},
		'check writeGroups' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(data.writeGroups, data.id + '/perms/wg');
		},
		'check readGroups' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(data.readGroups, data.id + '/perms/rg');
		},
		'check id' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(eventid_re.test(data.id), true);
		},
		'check response structure' : function(err, res, data) {
			var data = JSON.parse(data);
			delete data.createDate;
			delete data.updateDate;
			delete data.writeGroups;
			delete data.readGroups;
			delete data.writeUsers;
			delete data.readUsers;
			delete data.updateDate;
			delete data.id;

			assert.deepEqual(data, create_test_data_expected);
		},
		'check default perms' : {

			'write groups' : {

				topic : function(res, data) {

					setTimeout( function(data) {
						var data = JSON.parse(data);
						rest = new Rest();
						rest.get('/api' + data.writeGroups, this.callback);
					}.bind(this, data), 2000);

				},
				'check statusCode is 200' : function(err, res, data) {
					assert.equal(res.statusCode, statusCode.ALL_OK);
				},
				'check total_rows is an integer' : function(err, res, data) {
					var data = JSON.parse(data);
					assert.equal(number_re.test(data.total_rows), true);
				},
				'check total_rows value is 0' : function(err, res, data) {
					var data = JSON.parse(data);
					assert.strictEqual(data.total_rows, 0);
				},
				'check rows is an array' : function(err, res, data) {
					var data = JSON.parse(data);
					assert.notEqual(data.rows.constructor.toString().indexOf("Array"), -1);
				},
				'check rows length is 0' : function(err, res, data) {
					var data = JSON.parse(data);
					assert.equal(data.rows.length, 0);
				}
			},
			'write users' : {

				topic : function(res, data) {
					setTimeout( function(data) {
						var data = JSON.parse(data);
						rest = new Rest();
						rest.get('/api' + data.writeUsers, this.callback);
					}.bind(this, data), 2000);
				},
				'check statusCode is 200' : function(err, res, data) {
					assert.equal(res.statusCode, statusCode.ALL_OK);
				},
				'check total_rows is an integer' : function(err, res, data) {
					var data = JSON.parse(data);
					assert.equal(number_re.test(data.total_rows), true);
				},
				'check total_rows value is 1' : function(err, res, data) {
					var data = JSON.parse(data);
					assert.strictEqual(data.total_rows, 1);
				},
				'check rows is an array' : function(err, res, data) {
					var data = JSON.parse(data);
					assert.notEqual(data.rows.constructor.toString().indexOf("Array"), -1);
				},
				'check rows length is 1' : function(err, res, data) {

					var data = JSON.parse(data);
					assert.equal(data.rows.length, 1);
				},
				'check rows first item ' : function(err, res, data) {
					var data = JSON.parse(data);

					assert.equal(data.rows[0].grantTo, "/user/test");
				}
			},
			'read groups' : {

				topic : function(res, data) {
					setTimeout( function(data) {
						var data = JSON.parse(data);
						rest = new Rest();
						rest.get('/api' + data.readGroups, this.callback);
					}.bind(this, data), 2000);
				},
				'check statusCode is 200' : function(err, res, data) {
					assert.equal(res.statusCode, statusCode.ALL_OK);
				},
				'check total_rows is an integer' : function(err, res, data) {
					var data = JSON.parse(data);
					assert.equal(number_re.test(data.total_rows), true);
				},
				'check total_rows value is 1' : function(err, res, data) {
					var data = JSON.parse(data);
					assert.strictEqual(data.total_rows, 1);
				},
				'check rows is an array' : function(err, res, data) {
					var data = JSON.parse(data);
					assert.notEqual(data.rows.constructor.toString().indexOf("Array"), -1);
				},
				'check rows length is 1' : function(err, res, data) {

					var data = JSON.parse(data);
					assert.equal(data.rows.length, 1);
				},
				'check rows first item ' : function(err, res, data) {
					var data = JSON.parse(data);

					assert.equal(data.rows[0].grantTo, "/group/all");
				}
			},

			'read users' : {

				topic : function(res, data) {
					setTimeout( function(data) {
						var data = JSON.parse(data);
						rest = new Rest();
						rest.get('/api' + data.readUsers, this.callback);
					}.bind(this, data), 2000);
				},
				'check statusCode is 200' : function(err, res, data) {
					assert.equal(res.statusCode, statusCode.ALL_OK);
				},
				'check total_rows is an integer' : function(err, res, data) {
					var data = JSON.parse(data);
					assert.equal(number_re.test(data.total_rows), true);
				},
				'check total_rows value is 2' : function(err, res, data) {
					var data = JSON.parse(data);
					assert.strictEqual(data.total_rows, 2);
				},
				'check rows is an array' : function(err, res, data) {
					var data = JSON.parse(data);
					assert.notEqual(data.rows.constructor.toString().indexOf("Array"), -1);
				},
				'check rows length is 2' : function(err, res, data) {

					var data = JSON.parse(data);
					assert.equal(data.rows.length, 2);
				},
				'check rows first and second item ' : function(err, res, data) {
					var data = JSON.parse(data);

					var users = [data.rows[0].grantTo, data.rows[1].grantTo].sort()

					assert.deepEqual(users, ['/user/all', '/user/test']);
				}
			}
		}

	},

	'CREATE INVALID' : {
		topic : function() {
			rest = new Rest();
			rest.post('/api/event', JSON.stringify(create_invalid_test_data), this.callback);
		},
		'check statusCode is 400' : function(err, res, data) {
			assert.equal(res.statusCode, statusCode.BAD_REQUEST);
		},
		'check validation errors' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.deepEqual(data, create_invalid_test_data_expected)
		}
	},

	'CREATE INVALID 2' : {
		topic : function() {
			rest = new Rest();
			rest.post('/api/event', JSON.stringify(create_invalid_test_data_2), this.callback);
		},
		'check statusCode is 400' : function(err, res, data) {
			assert.equal(res.statusCode, statusCode.BAD_REQUEST);
		},
		'check validation errors' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.deepEqual(data, create_invalid_test_data_expected_2)
		}
	},

	'CREATE INVALID 3' : {
		topic : function() {
			rest = new Rest();
			rest.post('/api/event', JSON.stringify(create_invalid_test_data_3), this.callback);
		},
		'check statusCode is 400' : function(err, res, data) {
			assert.equal(res.statusCode, statusCode.BAD_REQUEST);
		},
		'check validation errors' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.deepEqual(data, create_invalid_test_data_expected_3)
		}
	},
	
	'CREATE INVALID 4' : {
		topic : function() {
			rest = new Rest();
			rest.post('/api/event', JSON.stringify(create_invalid_test_data_4), this.callback);
		},
		'check statusCode is 400' : function(err, res, data) {
			assert.equal(res.statusCode, statusCode.BAD_REQUEST);
		},
		'check validation errors' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.deepEqual(data, create_invalid_test_data_expected_4)
		}
	},
	
	'CREATE INVALID 5' : {
		topic : function() {
			rest = new Rest();
			rest.post('/api/event', JSON.stringify(create_invalid_test_data_5), this.callback);
		},
		'check statusCode is 400' : function(err, res, data) {
			assert.equal(res.statusCode, statusCode.BAD_REQUEST);
		},
		'check validation errors' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.deepEqual(data, create_invalid_test_data_expected_5)
		}
	},
	
	'CREATE INVALID 6' : {
		topic : function() {
			rest = new Rest();
			rest.post('/api/event', JSON.stringify(create_invalid_test_data_6), this.callback);
		},
		'check statusCode is 400' : function(err, res, data) {
			assert.equal(res.statusCode, statusCode.BAD_REQUEST);
		},
		'check validation errors' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.deepEqual(data, create_invalid_test_data_expected_6)
		}
	},
	
	'UPDATE' : {
		topic : function() {
			rest = new Rest();
			rest.put('/api' + update_test_data_in_database.id, JSON.stringify(update_test_data), this.callback);
		},
		'check updateDate' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.notEqual(data.createDate, data.updateDate);
			assert.equal(date_re.test(data.updateDate), true);
		},
		'check statusCode is 200' : function(err, res, data) {
			assert.equal(res.statusCode, statusCode.ALL_OK);
		},
		'check response structure' : function(err, res, data) {
			var data = JSON.parse(data);
			delete data.updateDate;

			assert.deepEqual(data, update_test_data_expected);
		}
	},

	'GET' : {
		topic : function() {
			rest = new Rest();
			rest.get('/api' + get_test_data_in_database.id, this.callback);
		},
		'check statusCode is 200' : function(err, res, data) {
			assert.equal(res.statusCode, statusCode.ALL_OK);
		},
		'check response structure' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.deepEqual(data, get_test_data_in_database);
		}
	},

	'GET LIST' : {
		topic : function() {
			rest = new Rest();
			rest.get('/api/event', this.callback);
		},
		'check statusCode is 200' : function(err, res, data) {
			assert.equal(res.statusCode, statusCode.ALL_OK);
		},
		'check total_rows is an integer' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(number_re.test(data.total_rows), true);
		},
		'check offset is an integer' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(number_re.test(data.offset), true);
		},
		'check offset value is zero' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.strictEqual(data.offset, 0);
		},
		'check rows is an array' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.notEqual(data.rows.constructor.toString().indexOf("Array"), -1);
		},
		'check rows item structure' : function(err, res, data) {
			var data = JSON.parse(data);

			for(var i = 0, l = data.rows.length; i < l; i++) {

				var keys = [];
				for(k in data.rows[i]) {
					keys.push(k)
				}

				assert.deepEqual(keys.sort(), data_keys);
			}

		}
	},

	'DELETE' : {
		topic : function() {
			rest = new Rest();
			rest.del('/api' + delete_test_data_in_database.id, this.callback);
		},
		'check statusCode is 204' : function(err, res, data) {
			assert.equal(res.statusCode, statusCode.DELETED);
		}
	}

}).export(module);
