/**
 * Module dependencies.
 */
var log = require('czagenda-log').from(__filename);
var express = require('express');
var oauth = require('./oauth');
var cors = require('./cors.js');

var app = module.exports = express.createServer();
 
// Configuration

app.configure(function() {
	
	app.use(cors);
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(oauth.parseHeader());
	app.use(app.router);
	
	
});
app.configure('development', function() {
	app.use(express.errorHandler({
		dumpExceptions : true,
		showStack : true
	}));
});

app.configure('production', function() {
	app.use(express.errorHandler());
});

