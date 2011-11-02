var vows = require('vows');
var assert = require('assert');
var Rest = require('../../libs/rest-client.js').Rest;

var statusCode = require('../../libs/statusCodes.js');
var settings = require('../../settings.js');

var tests_data = require('../tests_data');
var categoryid_re = new RegExp("^\/category\/[a-z0-9]+$");

var date_re = new RegExp("^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$");
var number_re = new RegExp("^[0-9]+$");

var data_keys = ['author', 'title', 'description', 'id',  'createDate', 'updateDate'].sort();

// CREATION

var created_obj = null;

var create_test_data = {
	title : 'TITLE_CATEGORY_1',
	description : 'DESCRIPTION_CATEGORY_1'
}

var create_test_data_expected = {
	title : 'TITLE_CATEGORY_1',
	description : 'DESCRIPTION_CATEGORY_1',
	author:"/user/staff"
}

var description = '';
for (var i = 0, l = 1500; i<l;i++) {
	description += 'a';
}
var create_invalid_test_data = {
	title : 'az',
	description : description
}

var create_invalid_test_data_expected = { errors : [], items : {title: [ 'string length must be greater than 5' ], description: [ 'string length must be lower than 1024' ] }};

var create_invalid_test_data_2 = {
	description : null
}
var create_invalid_test_data_expected_2 = {  errors : [], items : {title: [ 'a string is required' ] }};


// UPDATE
var update_test_data_in_database = tests_data.category_2;

var update_test_data = {
	title : 'MODIFIED_TITLE_CATEGORY_2',
	description : 'MODIFIED_DESCRIPTION_CATEGORY_2'
}

var update_test_data_expected = {
	title : 'MODIFIED_TITLE_CATEGORY_2',
	description : 'MODIFIED_DESCRIPTION_CATEGORY_2',
	id : '/category/8de0ea0cda9af2ff9be086310e650756',
	createDate : update_test_data_in_database.createDate,
	author:"/user/staff"
}

// GET
var get_test_data_in_database = tests_data.category_3;

var delete_test_data_in_database = tests_data.category_4;


vows.describe('Agenda API exchanged data structure').addBatch({
	
	'CREATE' : {
		topic : function() {
			rest = new Rest({token: "r3gvHGOpMs48jg2Dcf", token_secret:"dcm34D7JG0AJA7ippSPnBfuDLNIXTtIn", consumer:"vqfY05YtGqWfNalPqX", consumer_secret:"zlsH0YhTm2DmX6K8plHaeiRObJIjaB9b"});
			rest.post('/api/category', JSON.stringify(create_test_data), this.callback);
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
			delete data.id;
			assert.deepEqual(data, create_test_data_expected);
		},
		
		'check id' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(categoryid_re.test(data.id), true);
		}
	},
	
	'CREATE INVALID' : {
		topic : function() {
			rest = new Rest({token: "r3gvHGOpMs48jg2Dcf", token_secret:"dcm34D7JG0AJA7ippSPnBfuDLNIXTtIn", consumer:"vqfY05YtGqWfNalPqX", consumer_secret:"zlsH0YhTm2DmX6K8plHaeiRObJIjaB9b"});
			rest.post('/api/category', JSON.stringify(create_invalid_test_data), this.callback);
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
			rest = new Rest({token: "r3gvHGOpMs48jg2Dcf", token_secret:"dcm34D7JG0AJA7ippSPnBfuDLNIXTtIn", consumer:"vqfY05YtGqWfNalPqX", consumer_secret:"zlsH0YhTm2DmX6K8plHaeiRObJIjaB9b"});
			rest.post('/api/category', JSON.stringify(create_invalid_test_data_2), this.callback);
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
			rest = new Rest({token: "r3gvHGOpMs48jg2Dcf", token_secret:"dcm34D7JG0AJA7ippSPnBfuDLNIXTtIn", consumer:"vqfY05YtGqWfNalPqX", consumer_secret:"zlsH0YhTm2DmX6K8plHaeiRObJIjaB9b"});
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
			rest.get('/api'+get_test_data_in_database.id, this.callback);
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
			rest.get('/api/category',  this.callback);
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
			rest = new Rest({token: "r3gvHGOpMs48jg2Dcf", token_secret:"dcm34D7JG0AJA7ippSPnBfuDLNIXTtIn", consumer:"vqfY05YtGqWfNalPqX", consumer_secret:"zlsH0YhTm2DmX6K8plHaeiRObJIjaB9b"});
			rest.del('/api'+delete_test_data_in_database.id, this.callback);
		},
		'check statusCode is 204' : function(err, res, data) {
			assert.equal(res.statusCode, statusCode.DELETED);
		}
	}

}).export(module);
