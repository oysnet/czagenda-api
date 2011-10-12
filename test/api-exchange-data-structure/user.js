var vows = require('vows');
var assert = require('assert');
var Rest = require('../../libs/rest-client.js').Rest;

var statusCode = require('../../libs/statusCodes.js');
var settings = require('../../settings.js');
var tests_data = require('../tests_data');

var date_re = new RegExp("^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$");
var number_re = new RegExp("^[0-9]+$");

var data_keys = ['firstName', 'lastName', 'login', 'isActive', 'isStaff', 'isSuperuser', 'lastLogin', 'dateJoined', 'id', 'groups',  'createDate', 'updateDate' ].sort();

// CREATE
var create_test_data = {
	firstName : 'FIRST_NAME_USER_1',
	lastName : 'LAST_NAME_USER_1',
	email : 'EMAIL_USER_1@domain.com',
	login : 'LOGIN_USER_1'
}

var create_test_data_expected = {
	firstName : 'FIRST_NAME_USER_1',
	lastName : 'LAST_NAME_USER_1',
	//email : 'EMAIL_USER_1@domain.com',
	
	login : 'LOGIN_USER_1',
	isActive : false,
	isStaff : false,
	isSuperuser : false,
	lastLogin: null,
	dateJoined: null,	
	id : '/user/LOGIN_USER_1',
	groups : '/user/LOGIN_USER_1/groups'
}


var create_invalid_test_data = {
	firstName : 'FIRST_NAME_USER_1',
	lastName : 'LAST_NAME_USER_1',
	email : 'EMAIL_USER_1@domain.com'
}

var create_invalid_test_data_expected = {items:{ login: [ 'a string is required' ]}, errors:[]};

var create_invalid_test_data_2 = {
	firstName : 'F',
	lastName : 'L',
	email : '@domain.com',
	login : 'truc'
}

var create_invalid_test_data_expected_2 = { items:{ email: [ 'an email is required' ]}, errors:[]};

// UPDATE
var update_test_data_in_database = tests_data.user_2;

var update_test_data = {
	firstName : 'MODIFIED_FIRST_NAME_USER_2',
	lastName : 'MODIFIED_LAST_NAME_USER_2',
	email : 'EMAIL_USER_2@domain.com',
	login : 'LOGIN_USER_2'
}

var update_test_data_expected = {
	firstName : 'MODIFIED_FIRST_NAME_USER_2',
	lastName : 'MODIFIED_LAST_NAME_USER_2',
	//email : 'EMAIL_USER_2@domain.com',
	login : 'LOGIN_USER_2',
	isActive : false,
	isStaff : false,
	isSuperuser : false,
	lastLogin: null,
	dateJoined: null,	
	id : '/user/login-user-2',
	createDate : tests_data.user_2.createDate,
	groups : '/user/login-user-2/groups'
}



// GET
var get_test_data_in_database =  tests_data.user_3

var delete_test_data_in_database = tests_data.user_4


vows.describe('User API exchanged data structure').addBatch({

	'CREATE' : {
		topic : function() {
			rest = new Rest();
			rest.post('/api/user', JSON.stringify(create_test_data), this.callback);
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
			rest.post('/api/user', JSON.stringify(create_invalid_test_data), this.callback);
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
			rest.post('/api/user', JSON.stringify(create_invalid_test_data_2), this.callback);
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
			rest.get('/api'+get_test_data_in_database.id, this.callback);
		},
		
		'check statusCode is 200' : function(err, res, data) {
			assert.equal(res.statusCode, statusCode.ALL_OK);
		},
		
		'check response structure' : function(err, res, data) {
			var data = JSON.parse(data);
			delete get_test_data_in_database.email;
			assert.deepEqual(data, get_test_data_in_database);
		}
	},
	
	'GET LIST' : {
		topic : function() {
			rest = new Rest();
			rest.get('/api/user',  this.callback);
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
