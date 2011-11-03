var vows = require('vows');
var assert = require('assert');
var Rest = require('../../libs/rest-client.js').Rest;

var statusCode = require('../../libs/statusCodes.js');
var settings = require('../../settings.js');
var tests_data = require('../tests_data');

var forbidden_1 = tests_data.event_forbidden_1
var forbidden_2 = tests_data.event_forbidden_2

var group_access_1 = tests_data.event_group_access_1
var group_access_2 = tests_data.event_group_access_2

var agenda_forbidden = tests_data.agenda_forbidden_3
var group_access_agenda = tests_data.agenda_group_access_3

vows.describe('Event API permissions').addBatch({
	
	'ALL FORBIDDEN' : {
		
		'read' : {
			topic : function() {
				rest = new Rest();
				rest.get('/api' + forbidden_1,  this.callback);
			},
			
			'check statusCode is 403' : function(err, res, data) {
				
				assert.equal(res.statusCode, statusCode.FORBIDDEN);
			}
		},
		
		'read perms' : {
			topic : function() {
				rest = new Rest();
				rest.get('/api' + forbidden_1 + '/perms/wg',  this.callback);
			},
			
			'check statusCode is 200' : function(err, res, data) {
				assert.equal(res.statusCode, statusCode.FORBIDDEN);
			}
		},
		
		'create perms' : {
			topic : function() {
				rest = new Rest();
				rest.post('/api/perms/event/wu', JSON.stringify({"applyOn" : forbidden_1, "grantTo" : "/user/test2"}), this.callback);
			},
			
			'check statusCode is 403' : function(err, res, data) {
				
				assert.equal(res.statusCode, statusCode.FORBIDDEN);
			}
		},
		
		'update' : {
			topic : function() {
				rest = new Rest();
				rest.put('/api' + forbidden_1, JSON.stringify({event : {title : "event title" + Math.random(),
																	links : [{rel:"describedby", href:"/schema/event"}],
																	where : [{valueString:"Pau"}], category : "/category/34b74b021369bb23e67f22bad8f1229a"}
															}) ,this.callback);
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
	
	'ALL ALLOWED BY GROUP' : {
		
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
				rest.post('/api/perms/event/wu', JSON.stringify({"applyOn" : group_access_1, "grantTo" : "/user/test2"}), this.callback);
			},
			
			'check statusCode is 201' : function(err, res, data) {
				
				assert.equal(res.statusCode, statusCode.CREATED);
			}
		},
		
		'update' : {
			topic : function() {
				rest = new Rest();
				rest.put('/api' + group_access_1, JSON.stringify({event : {title : "event title" + Math.random(),
																	links : [{rel:"describedby", href:"/schema/event"}],
																	where : [{valueString:"Pau"}], category : "/category/34b74b021369bb23e67f22bad8f1229a"}
															}) , this.callback);
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
			
			'check statusCode is 204' : function(err, res, data) {
				assert.equal(res.statusCode, statusCode.DELETED);
			}
		},
	},
	
	'CREATE WITH AGENDA' : {
		
		'forbidden' : {
			topic : function() {
				rest = new Rest();
				rest.post('/api/event',  JSON.stringify({agenda : agenda_forbidden, event : {title : "event title",
																	links : [{rel:"describedby", href:"/schema/event"}],
																	where : [{valueString:"Pau"}], category : "/category/34b74b021369bb23e67f22bad8f1229a"}
															}) , this.callback);
			},
			
			'check statusCode is 403' : function(err, res, data) {
				
				assert.equal(res.statusCode, statusCode.FORBIDDEN);
			}
		},
		
		'allowed' : {
			topic : function() {
				rest = new Rest();
				rest.post('/api/event',  JSON.stringify({agenda : group_access_agenda, event : {title : "event title" + Math.random(),
																	links : [{rel:"describedby", href:"/schema/event"}],
																	where : [{valueString:"Pau"}], category : "/category/34b74b021369bb23e67f22bad8f1229a" }
															}) , this.callback);
			},
			
			'check statusCode is 201' : function(err, res, data) {
				
				assert.equal(res.statusCode, statusCode.CREATED);
			}
		},
	}

}).export(module);
