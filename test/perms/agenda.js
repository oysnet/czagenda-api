var vows = require('vows');
var assert = require('assert');
var Rest = require('../../libs/rest-client.js').Rest;

var statusCode = require('../../libs/statusCodes.js');
var settings = require('../../settings.js');
var tests_data = require('../tests_data');

var forbidden_1 = tests_data.agenda_forbidden_1
var forbidden_2 = tests_data.agenda_forbidden_2

var group_access_1 = tests_data.agenda_group_access_1
var group_access_2 = tests_data.agenda_group_access_2

vows.describe('Agenda API permissions').addBatch({
	
	'WRITE FORBIDDEN' : {
		
		'read' : {
			topic : function() {
				rest = new Rest();
				rest.get('/api' + forbidden_1,  this.callback);
			},
			
			'check statusCode is 200' : function(err, res, data) {
				
				assert.equal(res.statusCode, statusCode.ALL_OK);
			}
		},
		
		'read perms' : {
			topic : function() {
				rest = new Rest();
				rest.get('/api' + forbidden_1 + '/perms/wg',  this.callback);
			},
			
			'check statusCode is 200' : function(err, res, data) {
				
				assert.equal(res.statusCode, statusCode.ALL_OK);
			}
		},
		
		'create perms' : {
			topic : function() {
				rest = new Rest();
				rest.post('/api/perms/agenda/wu', JSON.stringify({"applyOn" : forbidden_1, "grantTo" : "/user/test2"}), this.callback);
			},
			
			'check statusCode is 403' : function(err, res, data) {
				
				assert.equal(res.statusCode, statusCode.FORBIDDEN);
			}
		},
		
		'update' : {
			topic : function() {
				rest = new Rest();
				rest.put('/api' + forbidden_1, '{}' ,this.callback);
			},
			
			'check statusCode is 403' : function(err, res, data) {
				
				assert.equal(res.statusCode, statusCode.FORBIDDEN);
			}
		},
		
		'delete' : {
			topic : function() {
				rest = new Rest();
				rest.del('/api' + forbidden_1, this.callback);
			},
			
			'check statusCode is 403' : function(err, res, data) {
				assert.equal(res.statusCode, statusCode.FORBIDDEN);
			}
		},
	},
	
	'WRITE ALLOWED BY GROUP' : {
		
		'read' : {
			topic : function() {
				rest = new Rest();
				rest.get('/api' + group_access_1,  this.callback);
			},
			
			'check statusCode is 200' : function(err, res, data) {
				
				assert.equal(res.statusCode, statusCode.ALL_OK);
			}
		},
		
		'read perms' : {
			topic : function() {
				rest = new Rest();
				rest.get('/api' + group_access_1 + '/perms/wg',  this.callback);
			},
			
			'check statusCode is 200' : function(err, res, data) {
				
				assert.equal(res.statusCode, statusCode.ALL_OK);
			}
		},
		
		'create perms' : {
			topic : function() {
				rest = new Rest();
				rest.post('/api/perms/agenda/wu', JSON.stringify({"applyOn" : group_access_1, "grantTo" : "/user/test2"}), this.callback);
			},
			
			'check statusCode is 200' : function(err, res, data) {
				
				assert.equal(res.statusCode, statusCode.ALL_OK);
			}
		},
		
		'update' : {
			topic : function() {
				rest = new Rest();
				rest.put('/api' + group_access_1, '{"description":"any words"}' , this.callback);
			},
			
			'check statusCode is 200' : function(err, res, data) {
				
				assert.equal(res.statusCode, statusCode.ALL_OK);
			}
		},
		
		'delete' : {
			topic : function() {
				rest = new Rest();
				rest.del('/api' + group_access_2, this.callback);
			},
			
			'check statusCode is 200' : function(err, res, data) {
				assert.equal(res.statusCode, statusCode.ALL_OK);
			}
		},
	},

}).export(module);
