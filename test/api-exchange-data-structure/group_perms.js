var vows = require('vows');
var assert = require('assert');
var Rest = require('../../libs/rest-client.js').Rest;

var statusCode = require('../../libs/statusCodes.js');
var settings = require('../../settings.js');

var tests_data = require('../tests_data');

var date_re = new RegExp("^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$");
var number_re = new RegExp("^[0-9]+$");

// ##### GET
var get_object = tests_data.group_3;
var write_group = tests_data.group_2;
var write_user = tests_data.user_test;

var write_group_perm = tests_data.perms_group_3_write_group_2
var write_user_perm = tests_data.perms_group_3_write_user_test

var create_object = tests_data.group_5;

var delete_write_group_perm = tests_data.perms_group_5_write_group_2
var delete_write_user_perm = tests_data.perms_group_5_write_user_2

vows.describe('Group perms API exchanged data structure').addBatch({

	'GET groups write' : {
		topic : function() {
			rest = new Rest();
			rest.get('/api'+get_object.writeGroups, this.callback);
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
		
		'check offset is an integer' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(number_re.test(data.offset), true);
		},
		
		'check offset value is zero' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.strictEqual(data.offset, 0);
		},
		
		'check rows first item createDate' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(date_re.test(data.rows[0].createDate), true);
		},
		
		'check rows first item updateDate' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(date_re.test(data.rows[0].updateDate), true);
		},
		
		'check rows first item structure' : function(err, res, data) {
			var data = JSON.parse(data);
			delete data.rows[0].createDate;
			delete data.rows[0].updateDate;
			assert.deepEqual(data.rows[0], {id : write_group_perm, grantTo: write_group.id} );
		}
	},
	
	'GET groups write include_docs' : {
		topic : function() {
			rest = new Rest();
			rest.get('/api'+get_object.writeGroups+ '?include_docs=true', this.callback);
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
		
		'check rows length is 1' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(data.rows.length, 1);
		},
		
		'check rows first item createDate' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(date_re.test(data.rows[0].createDate), true);
		},
		
		'check rows first item updateDate' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(date_re.test(data.rows[0].updateDate), true);
		},
		
		'check rows first item structure' : function(err, res, data) {
			var data = JSON.parse(data);
			delete data.rows[0].createDate;
			delete data.rows[0].updateDate;
						
			assert.deepEqual(data.rows[0], {id : write_group_perm, grantTo : write_group});
		}
	},
	
	'GET users write' : {
		topic : function() {
			rest = new Rest();
			rest.get('/api'+get_object.writeUsers, this.callback);
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
		
		'check offset is an integer' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(number_re.test(data.offset), true);
		},
		
		'check offset value is zero' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.strictEqual(data.offset, 0);
		},
		
		'check rows first item createDate' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(date_re.test(data.rows[0].createDate), true);
		},
		
		'check rows first item updateDate' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(date_re.test(data.rows[0].updateDate), true);
		},
		
		'check rows first item structure' : function(err, res, data) {
			var data = JSON.parse(data);
			delete data.rows[0].createDate;
			delete data.rows[0].updateDate;
			assert.deepEqual(data.rows[0], {id : write_user_perm, grantTo :  write_user.id});
		}
	},
	
	'GET users write include_docs' : {
		topic : function() {
			rest = new Rest();
			rest.get('/api'+get_object.writeUsers+ '?include_docs=true', this.callback);
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
		
		'check rows length is 1' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(data.rows.length, 1);
		},
		
		'check rows first item createDate' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(date_re.test(data.rows[0].createDate), true);
		},
		
		'check rows first item updateDate' : function(err, res, data) {
			var data = JSON.parse(data);
			assert.equal(date_re.test(data.rows[0].updateDate), true);
		},
		
		'check rows first item structure' : function(err, res, data) {
			var data = JSON.parse(data);
			delete data.rows[0].createDate;
			delete data.rows[0].updateDate;
			delete write_user.email;
			
			delete data.rows[0].grantTo.lastSeen;
			delete write_user.lastSeen;
			
			assert.deepEqual(data.rows[0], {id : write_user_perm, grantTo : write_user});
		}
	},
	
	
	'CREATE Write Group perm' : {
		topic : function() {
			rest = new Rest();
			rest.post('/api/perms/group/wg', JSON.stringify({grantTo : write_group.id, applyOn : create_object.id}), this.callback);
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
			var re = new RegExp("^\/perms/group\/wg\/[0-9a-z]+$")
			assert.equal(re.test(data.id), true);
		},
		
		'check response structure' : function(err, res, data) {
			var data = JSON.parse(data);
			
			delete data.createDate;
			delete data.updateDate;
			delete data.id;						
			assert.deepEqual(data, {applyOn : create_object.id,
									grantTo :  write_group.id
									} );
		}
		
	},
	
	
	'CREATE Write User perm' : {
		topic : function() {
			setTimeout(function () {
				rest = new Rest();
				rest.post('/api/perms/group/wu', JSON.stringify({grantTo : write_user.id, applyOn : create_object.id}), this.callback);
			}.bind(this), 1000)
			
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
			var re = new RegExp("^\/perms/group\/wu\/[0-9a-z]+$")
			assert.equal(re.test(data.id), true);
		},
		
		'check response structure' : function(err, res, data) {
			var data = JSON.parse(data);
			
			delete data.createDate;
			delete data.updateDate;
			delete data.id;						
			assert.deepEqual(data, {applyOn :  create_object.id,
									grantTo :  write_user.id
									} );
		}
		
	},
	
	'DELETE Write group perm' : {
		topic : function() {
			setTimeout( function() {
				rest = new Rest();
				rest.del('/api'+delete_write_group_perm, this.callback);
			}.bind(this), 2000)
			
			
		},
		'check statusCode is 204' : function(err, res, data) {
			assert.equal(res.statusCode, statusCode.DELETED);
		}
	},
	
	'DELETE Write user perm' : {
		topic : function() {
			setTimeout( function() {
				rest = new Rest();
				rest.del('/api'+delete_write_user_perm, this.callback);
			}.bind(this), 4000)
			
			
		},
		'check statusCode is 204' : function(err, res, data) {
			assert.equal(res.statusCode, statusCode.DELETED);
		}
	}
	

}).export(module);
