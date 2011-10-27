var vows = require('vows');
var assert = require('assert');
var Rest = require('../../libs/rest-client.js').Rest;

var statusCode = require('../../libs/statusCodes.js');
var settings = require('../../settings.js');
var tests_data = require('../tests_data');

var date_re = new RegExp("^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$");
var number_re = new RegExp("^[0-9]+$");
var entityid_re = new RegExp("^\/entity\/[a-z0-9]+$");


var data_keys = [ 'author', 'createDate', 'updateDate', 'writeUsers', 'writeGroups', 'id', 'entity'].sort();

// CREATION
var create_test_data = {
	
	entity : {name : "Entity Name",
			type : "organization",
			links : [{rel:"describedby", href:"/schema/organization"}],
			where : [{valueString:"Pau"}]}
}

var create_test_data_expected = {
	author : '/user/test',
	entity : {name : "Entity Name",
			type : "organization",
			links : [{rel:"describedby", href:"/schema/organization"}],
			where : [{valueString:"Pau"}]}
}

var create_invalid_test_data = {
	entity : {name : "Entity Name", type : "organization"},
}

var create_invalid_test_data_expected = { items : {'entity.links': [ 'required' ] }, errors : []};


var create_invalid_test_data_2 = {
	entity : {type : "organization", name : "entity that fail to validate against schema",links : [{rel:"describedby", href:"/schema/organization"}],
			where : [{valueString: 2}]}
}

var create_invalid_test_data_expected_2 = { items : { '/entity/where/0/valueString': [ 'a string is required' ] }, errors : []};


// UPDATE
var update_test_data_in_database = tests_data.entity_1;

var update_test_data = {
	entity : {
		type : "organization",
		name : 'modified entity name',
		links : [{rel:"describedby", href:"/schema/organization"}],
		where : [{valueString:"Pau"}]
	}
}

var update_test_data_expected = {
	id : tests_data.entity_1.id,
	createDate : tests_data.entity_1.createDate,
	writeUsers : tests_data.entity_1.writeUsers,
	writeGroups : tests_data.entity_1.writeGroups,
	author : tests_data.entity_1.author,
	entity : {
		type : "organization",
		name : 'modified entity name',
		links : [{rel:"describedby", href:"/schema/organization"}],
		where : [{valueString:"Pau"}]
	}
}

// GET
var get_test_data_in_database = tests_data.entity_2;

var delete_test_data_in_database = tests_data.entity_3;


vows.describe('Event API exchanged data structure').addBatch({

	'CREATE' : {
		topic : function() {
			rest = new Rest();
			rest.post('/api/entity', JSON.stringify(create_test_data), this.callback);
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
		
		'check writeGroups' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(data.writeGroups, data.id + '/perms/wg');
		},
		
		'check id' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(entityid_re.test(data.id), true);
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
			
				topic : function (res, data) {
					
					setTimeout(function (data) {
						var data = JSON.parse(data);					
						rest = new Rest();
						rest.get('/api' + data.writeGroups,  this.callback);
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
			
				topic : function (res, data) {
					setTimeout(function (data) {
						var data = JSON.parse(data);
						rest = new Rest();
						rest.get('/api' + data.writeUsers,  this.callback);
					}.bind(this, data),2000);
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
			}
		}
		
	},
	
	'CREATE INVALID' : {
		topic : function() {
			rest = new Rest();
			rest.post('/api/entity', JSON.stringify(create_invalid_test_data), this.callback);
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
			rest.post('/api/entity', JSON.stringify(create_invalid_test_data_2), this.callback);
		},
		
		'check statusCode is 400' : function(err, res, data) {
			assert.equal(res.statusCode, statusCode.BAD_REQUEST);
		},
		
		'check validation errors' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.deepEqual(data, create_invalid_test_data_expected_2)
		}
	},
	
	'UPDATE' : {
		topic : function() {
			rest = new Rest();
			rest.put('/api'+update_test_data_in_database.id, JSON.stringify(update_test_data), this.callback);
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
			rest.get('/api'+get_test_data_in_database.id,  this.callback);
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
			rest.get('/api/entity',  this.callback);
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
			
			for (var i = 0, l = data.rows.length; i<l; i++) {
				
				var keys = [];
				for (k in data.rows[i]) {
					keys.push(k)
				}
				
				assert.deepEqual(keys.sort(), data_keys);
			}
			
		}
	},
	
	'DELETE' : {
		topic : function() {
			rest = new Rest();
			rest.del('/api'+delete_test_data_in_database.id, this.callback);
		},
		'check statusCode is 204' : function(err, res, data) {
			assert.equal(res.statusCode, statusCode.DELETED);
		}
	}

}).export(module);
