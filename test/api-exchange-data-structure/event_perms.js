var vows = require('vows');
var assert = require('assert');
var Rest = require('../../libs/rest-client.js').Rest;

var statusCode = require('../../libs/statusCodes.js');
var settings = require('../../settings.js');

var tests_data = require('../tests_data');

var date_re = new RegExp("^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$");
var number_re = new RegExp("^[0-9]+$");

// ##### GET
var get_object = tests_data.event_1;
var write_group = tests_data.group_2;
var write_user = tests_data.user_2;

var write_group_perm = tests_data.perms_event_1_write_group_2
var write_user_perm = tests_data.perms_event_1_write_user_2
var read_group_perm = tests_data.perms_event_1_read_group_2
var read_user_perm = tests_data.perms_event_1_read_user_2

var create_object = tests_data.event_2;

var delete_write_group_perm = tests_data.perms_event_2_write_group_2
var delete_write_user_perm = tests_data.perms_event_2_write_user_2
var delete_read_group_perm = tests_data.perms_event_2_read_group_2
var delete_read_user_perm = tests_data.perms_event_2_read_user_2

vows.describe('Group perms API exchanged data structure').addBatch({

	'GET groups write' : {
		topic : function() {
			rest = new Rest();
			rest.get(get_object.writeGroups, this.callback);
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
			assert.deepEqual(data.rows[0], {id : write_group_perm, grantTo : write_group.id});
		}
	},
	
	'GET groups read' : {
		topic : function() {
			rest = new Rest();
			rest.get(get_object.readGroups, this.callback);
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
			assert.deepEqual(data.rows[0], {id : read_group_perm, grantTo :write_group.id});
		}
	},
	
	'GET groups write include_docs' : {
		topic : function() {
			rest = new Rest();
			rest.get(get_object.writeGroups+ '?include_docs=true', this.callback);
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
	
	'GET groups read include_docs' : {
		topic : function() {
			rest = new Rest();
			rest.get(get_object.readGroups+ '?include_docs=true', this.callback);
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
			
			assert.deepEqual(data.rows[0], {id : read_group_perm, grantTo : write_group});
		}
	},
	
	
	'GET users write' : {
		topic : function() {
			rest = new Rest();
			rest.get(get_object.writeUsers, this.callback);
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
			assert.deepEqual(data.rows[0], {id : write_user_perm, grantTo : write_user.id});
		}
	},
	
	'GET users read' : {
		topic : function() {
			rest = new Rest();
			rest.get(get_object.readUsers, this.callback);
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
			assert.deepEqual(data.rows[0], {id : read_user_perm, grantTo: write_user.id});
		}
	},
	
	'GET users write include_docs' : {
		topic : function() {
			rest = new Rest();
			rest.get(get_object.writeUsers+ '?include_docs=true', this.callback);
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
			assert.deepEqual(data.rows[0], {id : write_user_perm, grantTo : write_user});
		}
	},
	
	'GET users read include_docs' : {
		topic : function() {
			rest = new Rest();
			rest.get(get_object.readUsers+ '?include_docs=true', this.callback);
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
			assert.deepEqual(data.rows[0], {id : read_user_perm, grantTo : write_user});
		}
	},
	
	
	'CREATE Write Group perm' : {
		topic : function() {
			rest = new Rest();
			rest.post('/perms/event/wg', JSON.stringify({grantTo : write_group.id, applyOn : create_object.id}), this.callback);
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
			var re = new RegExp("^\/perms/event\/wg\/[0-9a-z]+$")
			assert.equal(re.test(data.id), true);
		},
		
		'check response structure' : function(err, res, data) {
			var data = JSON.parse(data);
			
			delete data.createDate;
			delete data.updateDate;
			delete data.id;						
			assert.deepEqual(data, {applyOn :create_object.id,
									grantTo : write_group.id
									} );
		}
		
	},
	
	'CREATE Read Group perm' : {
		topic : function() {
			rest = new Rest();
			rest.post('/perms/event/rg', JSON.stringify({grantTo : write_group.id, applyOn : create_object.id}), this.callback);
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
			var re = new RegExp("^\/perms/event\/rg\/[0-9a-z]+$")
			assert.equal(re.test(data.id), true);
		},
		
		'check response structure' : function(err, res, data) {
			var data = JSON.parse(data);
			
			delete data.createDate;
			delete data.updateDate;
			delete data.id;						
			assert.deepEqual(data, {applyOn :  create_object.id,
									grantTo : write_group.id
									} );
		}
		
	},
	
	
	'CREATE Write User perm' : {
		topic : function() {
			rest = new Rest();
			rest.post('/perms/event/wu', JSON.stringify({grantTo : write_user.id, applyOn : create_object.id}), this.callback);
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
			var re = new RegExp("^\/perms/event\/wu\/[0-9a-z]+$")
			assert.equal(re.test(data.id), true);
		},
		
		'check response structure' : function(err, res, data) {
			var data = JSON.parse(data);
			
			delete data.createDate;
			delete data.updateDate;
			delete data.id;						
			assert.deepEqual(data, {applyOn :  create_object.id,
									grantTo :write_user.id
									} );
		}
		
	},
	
	'CREATE Read User perm' : {
		topic : function() {
			rest = new Rest();
			rest.post('/perms/event/ru', JSON.stringify({grantTo : write_user.id, applyOn : create_object.id}), this.callback);
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
			var re = new RegExp("^\/perms/event\/ru\/[0-9a-z]+$")
			assert.equal(re.test(data.id), true);
		},
		
		'check response structure' : function(err, res, data) {
			var data = JSON.parse(data);
			
			delete data.createDate;
			delete data.updateDate;
			delete data.id;						
			assert.deepEqual(data, {applyOn : create_object.id,
									grantTo :  write_user.id
									} );
		}
	},
	
	'DELETE Write group perm' : {
		topic : function() {
			rest = new Rest();
			rest.del(delete_write_group_perm, this.callback);
		},
		'check statusCode is 204' : function(err, res, data) {
			assert.equal(res.statusCode, statusCode.DELETED);
		}
	},
	
	'DELETE Write user perm' : {
		topic : function() {
			rest = new Rest();
			rest.del(delete_write_user_perm, this.callback);
		},
		'check statusCode is 204' : function(err, res, data) {
			assert.equal(res.statusCode, statusCode.DELETED);
		}
	},
	
	'DELETE Read group perm' : {
		topic : function() {
			rest = new Rest();
			rest.del(delete_read_group_perm, this.callback);
		},
		'check statusCode is 204' : function(err, res, data) {
			assert.equal(res.statusCode, statusCode.DELETED);
		}
	},
	
	'DELETE Read user perm' : {
		topic : function() {
			rest = new Rest();
			rest.del(delete_read_user_perm, this.callback);
		},
		'check statusCode is 204' : function(err, res, data) {
			assert.equal(res.statusCode, statusCode.DELETED);
		}
	}
	

}).export(module);
