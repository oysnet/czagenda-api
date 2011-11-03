var vows = require('vows');
var assert = require('assert');
var Rest = require('../../libs/rest-client.js').Rest;

var statusCode = require('../../libs/statusCodes.js');
var settings = require('../../settings.js');

var tests_data = require('../tests_data');

var date_re = new RegExp("^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$");
var number_re = new RegExp("^[0-9]+$");


var create_invalid_test_data = {
	user : '/test/login1',
	group : '/test/aaaaaa'
}

var create_invalid_test_data_expected = { items : {user: [ 'must match regexp: ^/user/[-_.0-9a-zA-Z]+$' ],
										  group: [ 'must match regexp: ^/group/[-_.0-9a-z]+$']}, errors:[] };

// ##### GET
var user_5 = tests_data.user_5;


var group_5 = tests_data.group_5;

var user_5_group_5 = {
	id : tests_data.membership_user_5_group_5,	
	user : user_5.id
}

var user_5_group_5_include_docs = {
	id : tests_data.membership_user_5_group_5,	
	user : user_5
}


var group_5_user_5 = {
	id : tests_data.membership_user_5_group_5,	
	group : group_5.id
}

var group_5_user_5_include_docs = {
	id : tests_data.membership_user_5_group_5,	
	group : group_5
}

// ##### CREATE
var user_6 = tests_data.user_6

// ##### DELETE

var user_7 = tests_data.user_7;


vows.describe('User groups membership API exchanged data structure').addBatch({
	
	
	'GET Users Memberships' : {
		topic : function() {
			rest = new Rest();
			rest.get('/api'+user_5.groups, this.callback);
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
		
		'check rows first item createDate' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(date_re.test(data.rows[0].createDate), true);
		},
		
		'check rows first item structure' : function(err, res, data) {
			var data = JSON.parse(data);
			delete data.rows[0].createDate;
			delete data.rows[0].updateDate;
			assert.deepEqual(data.rows[0], group_5_user_5);
		}
	},
	
	'GET Users Memberships include_docs' : {
		topic : function() {
			rest = new Rest();
			rest.get('/api'+user_5.groups + '?include_docs=true', this.callback);
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
		
		'check rows first item createDate' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(date_re.test(data.rows[0].createDate), true);
		},
		
		'check rows first item structure' : function(err, res, data) {
			var data = JSON.parse(data);
			delete data.rows[0].createDate;
			delete data.rows[0].updateDate;
			
			delete data.rows[0].group.updateDate;
			delete group_5_user_5_include_docs.group.updateDate
			
			assert.deepEqual(data.rows[0], group_5_user_5_include_docs);
		}
	},
	
	'GET Group Memberships' : {
		topic : function() {
			rest = new Rest();
			rest.get('/api'+group_5.users, this.callback);
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
		
		'check rows first item createDate' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(date_re.test(data.rows[0].createDate), true);
		},
		
		'check rows first item structure' : function(err, res, data) {
			var data = JSON.parse(data);
			delete data.rows[0].createDate;
			delete data.rows[0].updateDate;
			assert.deepEqual(data.rows[0], user_5_group_5);
		}
	},
	
	'GET Groups Memberships include_docs' : {
		topic : function() {
			rest = new Rest();
			rest.get('/api'+group_5.users + '?include_docs=true', this.callback);
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
		
		'check rows first item createDate' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(date_re.test(data.rows[0].createDate), true);
		},
		
		'check rows first item structure' : function(err, res, data) {
			var data = JSON.parse(data);
			delete data.rows[0].createDate;
			delete data.rows[0].updateDate;
			delete user_5_group_5_include_docs.user.email;
						
			assert.deepEqual(data.rows[0], user_5_group_5_include_docs);
		}
	},
	
	
	'CREATE Membership' : {
		topic : function() {
			rest = new Rest();
			rest.post('/api/membership', JSON.stringify({group : group_5.id, user : user_6.id}), this.callback);
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
			assert.equal(date_re.test(data.updateDate), true);
		},
		
		'check id' : function(err, res, data) {
			var data = JSON.parse(data);
			var re = new RegExp("^\/membership\/[0-9a-z]+$")
			assert.equal(re.test(data.id), true);
		},
		
		'check response structure' : function(err, res, data) {
			var data = JSON.parse(data);
			
			delete data.createDate;
			delete data.updateDate;
			delete data.id						
			assert.deepEqual(data, {group : group_5.id, user :  user_6.id});
		}
		
	},
	
	'CREATE INVALID' : {
		topic : function() {
			rest = new Rest();
			rest.post('/api/membership', JSON.stringify(create_invalid_test_data), this.callback);
		},
		
		'check statusCode is 400' : function(err, res, data) {
			assert.equal(res.statusCode, statusCode.BAD_REQUEST);
		},
		
		'check validation errors' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.deepEqual(data, create_invalid_test_data_expected)
		}
	},
	
	'DELETE Membership' : {
		topic : function() {
			rest = new Rest();
			rest.del('/api'+tests_data.membership_user_7_group_5, this.callback);
		},
		'check statusCode is 204' : function(err, res, data) {
			assert.equal(res.statusCode, statusCode.DELETED);
		}
	}
	

}).export(module);
