var vows = require('vows');
var assert = require('assert');
var Rest = require('../../libs/rest-client.js').Rest;

var statusCode = require('../../libs/statusCodes.js');
var settings = require('../../settings.js');
var tests_data = require('../tests_data');

var date_re = new RegExp("^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$");
var number_re = new RegExp("^[0-9]+$");
var eventid_re = new RegExp("^\/event\/[a-z0-9]+$");

var data_keys = ['name', 'status', 'sample', 'template', 'final', 'createDate', 'updateDate', 'id', 'schema'].sort();

// CREATION
var create_test_data = {
	name: 'NAME_SCHEMA_1',
	sample: 'sample data',
	template: 'template data',
	schema: {}
}

var create_test_data_expected = {
	id: '/schema/name-schema-1',
	name: 'NAME_SCHEMA_1',
	sample: 'sample data',
	template: 'template data',
	'final': false,
	status: 'PENDING',
	schema: {id: '/schema/name-schema-1'}
}

var create_invalid_test_data = {
	'name' : 'truc',
	schema : {}
}
var create_invalid_test_data_expected = { name: [ 'string length must be greater than 5' ]};
										 

var create_invalid_test_data_2 = {
	schema : {}
}
var create_invalid_test_data_expected_2 = { name: [ 'a string is required' ]};								 

// UPDATE
var update_test_data_in_database = tests_data.schema_2;

var update_test_data = {
	name : 'NAME_SCHEMA_21',
	sample : 'sample data',
	template : 'template data',
	schema : {
		id :  '/schema/name-schema-2',
		description : 'schema description'
	}
}

var update_test_data_expected = {
	id : '/schema/name-schema-2',
	name : 'NAME_SCHEMA_21',
	createDate : tests_data.schema_2.createDate,
	'final' : false,
	status : 'DRAFT',
	sample : 'sample data',
	template : 'template data',
	schema : {
		id :  '/schema/name-schema-2',
		description : 'schema description'
	}
}

// GET
var get_test_data_in_database = tests_data.schema_3;

var delete_test_data_in_database = tests_data.schema_4; 


vows.describe('Schema API exchanged data structure').addBatch({

	'CREATE' : {
		topic : function() {
			rest = new Rest();
			rest.post('/schema', JSON.stringify(create_test_data), this.callback);
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
		
		'check response structure' : function(err, res, data) {
			var data = JSON.parse(data);
			
			delete data.createDate;
			delete data.updateDate;
						
			assert.deepEqual(data, create_test_data_expected);
		}
		
	},

	'CREATE INVALID' : {
		topic : function() {
			rest = new Rest();
			rest.post('/schema', JSON.stringify(create_invalid_test_data), this.callback);
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
			rest.post('/schema', JSON.stringify(create_invalid_test_data_2), this.callback);
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
			rest.put(update_test_data_in_database.id, JSON.stringify(update_test_data), this.callback);
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
			rest.get(get_test_data_in_database.id,  this.callback);
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
			rest.get('/schema',  this.callback);
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
			rest.del(delete_test_data_in_database.id, this.callback);
		},
		'check statusCode is 204' : function(err, res, data) {
			assert.equal(res.statusCode, statusCode.DELETED);
		}
	}

}).export(module);
