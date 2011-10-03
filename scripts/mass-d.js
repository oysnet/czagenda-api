
var async = require('async')
var Rest = require('../libs/rest-client.js').Rest;

function MassCreate (quantity, callback) {
	
	this.finalCallback = callback;
	this.quantity = quantity;
	
	this.checkCounter();
		
	this.createUsers(quantity);
	this.createAgendas(quantity);
	this.createGroups(quantity);
	
	setTimeout(this.checkForResults.bind(this), 100);
	
}

MassCreate.prototype.counter = 0;

MassCreate.prototype.checkForResults = function () {

	var x = this.quantity / 10;
	
	if (this.users.length > x && this.agendas.length > x && this.groups.length > x) {
		this.createRelations();
		this.createEvents();
	} else {
		setTimeout(this.checkForResults.bind(this), 100);
	}
}

MassCreate.prototype.checkCounter = function () {
	
	if (this.counter === this.quantity * 5) {
		this.finalCallback();
	} else {
		setTimeout(this.checkCounter.bind(this), 100);
	}
	
}

MassCreate.prototype.createRelations = function () {
	
	var rest = new Rest('10.7.36.130', 8000);
	for (var i = 0, l = this.quantity; i<l; i++ ) {
		
		var data = {
			user : this.users[Math.floor(Math.random() * this.users.length)], 
			group : this.groups[Math.floor(Math.random() * this.groups.length)]
		};
		rest.post("/membership", JSON.stringify(data), this.callback.bind(this, 'MEMBERSHIP'));
	}
	
}


MassCreate.prototype.createEvents = function () {
	var rest = new Rest('10.7.36.130', 8000);
	for (var i = 0, l = this.quantity; i<l; i++ ) {
		
		var data = {
			event : {'title' : 'title event...', 'random' : Math.random()},
			author : this.users[Math.floor(Math.random() * this.users.length)]
		};
		rest.post("/event", JSON.stringify(data), this.callback.bind(this, 'EVENT'));
		
	}
}


MassCreate.prototype.callback = function (type, err, res, data) {
	if (err !== null || res.statusCode !== 201) {
		console.log(type, err, (res !== null && typeof(res) !== 'undefined' ? res.statusCode : null) , data);
		
	}
	this.counter++;
}


MassCreate.prototype.users = []
MassCreate.prototype.createUsers = function (quantity) {

	var rest = new Rest('10.7.36.130', 8000);
	for (var i = 0, l = quantity; i<l;i++) {
		
		var data = {
			login : 'user ' + String(Math.random()),
			firstName:'TEST',
			lastName:'TEST',
			email:'email' +String(Math.random())+ '@domain.com',
			password: 'a strong password'
			
		};
		rest.post("/user", JSON.stringify(data), this.callbackCreateUser.bind(this));
	}
	
}

MassCreate.prototype.callbackCreateUser = function (err, res, data) {
	
	if (err !== null || res.statusCode !== 201) {
		console.log('USER', err, (res !== null && typeof(res) !== 'undefined' ? res.statusCode : null) , data);
		return;
	}
	this.users.push(JSON.parse(data).id);
	this.counter++;
}

MassCreate.prototype.agendas = []
MassCreate.prototype.createAgendas = function (quantity) {
	var rest = new Rest('10.7.36.130', 8000);
	for (var i = 0, l = quantity; i<l;i++) {
		
		var data = {
			title : 'agenda ' + String(Math.random()),
			description: 'a very short description'
			
		};
		rest.post("/agenda", JSON.stringify(data), this.callbackCreateAgenda.bind(this));
	}
}
MassCreate.prototype.callbackCreateAgenda = function (err, res, data) {
	if (err !== null || res.statusCode !== 201) {
		console.log('AGENDA', err, (res !== null && typeof(res) !== 'undefined' ? res.statusCode : null) , data);
		return;
	}
	this.agendas.push(JSON.parse(data).id);
	this.counter++;
}


MassCreate.prototype.groups = []
MassCreate.prototype.createGroups = function (quantity) {
	var rest = new Rest('10.7.36.130', 8000);
	for (var i = 0, l = quantity; i<l;i++) {
		
		var data = {
			title : 'group ' + String(Math.random()),
			description: 'a very short description'
			
		};
		rest.post("/group", JSON.stringify(data), this.callbackCreateGroup.bind(this));
	}
}

MassCreate.prototype.callbackCreateGroup = function (err, res, data) {
	if (err !== null || res.statusCode !== 201) {
		console.log('GROUP', err, (res !== null && typeof(res) !== 'undefined' ? res.statusCode : null) , data);
		return;
	}
	this.groups.push(JSON.parse(data).id);
	this.counter++;
}

module.exports = MassCreate

/*
var counter = 0;
var cb = function () {
	counter++;
	console.log('finished iter ' + counter)
	if (counter < 1000) {
		new MassCreate(100,cb);
	}
	
}*/
new MassCreate(10000,console.log);

