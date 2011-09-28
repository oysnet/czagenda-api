var async = require('async'),
	Rest = require('../libs/rest-client').Rest,
	testsData = require('./tests_data');
	
	
var datas = {
	agenda_2 : testsData.agenda_2,
	agenda_3 : testsData.agenda_3,
	agenda_4 : testsData.agenda_4,
	
	event_1 : testsData.event_1,
	event_2 : testsData.event_2,
	event_3 : testsData.event_3,
	
	group_2 : testsData.group_2,
	group_3 : testsData.group_3,
	group_4 : testsData.group_4,
	group_5 : testsData.group_5,
	
	schema_2 : testsData.schema_2,
	schema_3 : testsData.schema_3,
	schema_4 : testsData.schema_4,
	
	user_2 : testsData.user_2,
	user_3 : testsData.user_3,
	user_4 : testsData.user_4,
	user_5 : testsData.user_5,
	user_6 : testsData.user_6,
	user_7 : testsData.user_7,
	
};
	
async.auto({
    
    // agenda
    /*1: function(callback){
       rest = new Rest();
       
	   rest.post('/perms/agenda/wg', JSON.stringify({applyOn : datas.agenda_2.id, grantTo : datas.group_2.id}), function (err, res, data) {
			callback(null);	
	   });     
    },
    
    2: function(callback){
       rest = new Rest();
       
	   rest.post('/perms/agenda/wu', JSON.stringify({applyOn : datas.agenda_2.id, grantTo : datas.user_2.id}), function (err, res, data) {
			callback(null);	
	   });     
    },
    
    3: function(callback){
       rest = new Rest();
       
	   rest.post('/perms/agenda/wg', JSON.stringify({applyOn : datas.agenda_3.id, grantTo : datas.group_2.id}), function (err, res, data) {
			callback(null);	
	   });     
    },
    
    4: function(callback){
       rest = new Rest();
       
	   rest.post('/perms/agenda/wu', JSON.stringify({applyOn : datas.agenda_3.id, grantTo : datas.user_2.id}), function (err, res, data) {
			callback(null);	
	   });     
    },
    
    
    // group
    5: function(callback){
       rest = new Rest();
       
	   rest.post('/perms/group/wg', JSON.stringify({applyOn : datas.group_3.id, grantTo : datas.group_2.id}), function (err, res, data) {
			callback(null);	
	   });     
    },
    
    6: function(callback){
       rest = new Rest();
       
	   rest.post('/perms/group/wu', JSON.stringify({applyOn : datas.group_3.id, grantTo : datas.user_2.id}), function (err, res, data) {
			callback(null);	
	   });     
    },
    
     7: function(callback){
       rest = new Rest();
       
	   rest.post('/perms/group/wg', JSON.stringify({applyOn : datas.group_5.id, grantTo : datas.group_2.id}), function (err, res, data) {
			callback(null);	
	   });     
    },
    
    8: function(callback){
       rest = new Rest();
       
	   rest.post('/perms/group/wu', JSON.stringify({applyOn : datas.group_5.id, grantTo : datas.user_2.id}), function (err, res, data) {
			callback(null);	
	   });     
    },
    */
    // event
    9: function(callback){
       rest = new Rest();
       
	   rest.post('/perms/event/wu', JSON.stringify({applyOn : datas.event_1.id, grantTo : datas.user_2.id}), function (err, res, data) {
			callback(null);	
	   });     
    },
    10: function(callback){
       rest = new Rest();
       
	   rest.post('/perms/event/ru', JSON.stringify({applyOn : datas.event_1.id, grantTo : datas.user_2.id}), function (err, res, data) {
			callback(null);	
	   });     
    },
    
    11: function(callback){
       rest = new Rest();
       
	   rest.post('/perms/event/wg', JSON.stringify({applyOn : datas.event_1.id, grantTo : datas.group_2.id}), function (err, res, data) {
			callback(null);	
	   });     
    },
    12: function(callback){
       rest = new Rest();
       
	   rest.post('/perms/event/rg', JSON.stringify({applyOn : datas.event_1.id, grantTo : datas.group_2.id}), function (err, res, data) {
			callback(null);	
	   });     
    },
    
    13: function(callback){
       rest = new Rest();
       
	   rest.post('/perms/event/wu', JSON.stringify({applyOn : datas.event_2.id, grantTo : datas.user_2.id}), function (err, res, data) {
			callback(null);	
	   });     
    },
    14: function(callback){
       rest = new Rest();
       
	   rest.post('/perms/event/ru', JSON.stringify({applyOn : datas.event_2.id, grantTo : datas.user_2.id}), function (err, res, data) {
			callback(null);	
	   });     
    },
    
    15: function(callback){
       rest = new Rest();
       
	   rest.post('/perms/event/wg', JSON.stringify({applyOn : datas.event_2.id, grantTo : datas.group_2.id}), function (err, res, data) {
			callback(null);	
	   });     
    },
    16: function(callback){
       rest = new Rest();
       
	   rest.post('/perms/event/rg', JSON.stringify({applyOn : datas.event_2.id, grantTo : datas.group_2.id}), function (err, res, data) {
			callback(null);	
	   });     
    },
});
