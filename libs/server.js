/**
 * Module dependencies.
 */
var log = require('czagenda-log').from(__filename);
var express = require('express');
var oauth = require('./oauth');
var cors = require('./cors.js');
var app = module.exports = express.createServer();
var http = require('http');
var async = require('async');
// Configuration

app.configure(function() {

	app.use(function(req, res, next) {

		res.end = function() {

			var args = arguments;

			var req = this.req;
			if( typeof (req.locks) !== 'undefined' && req.locks.length > 0) {

				var locks = req.locks;

				if(locks.length === 1) {
					locks[0].release( function() {
						http.ServerResponse.prototype.end.apply(this, args);
					}.bind(this));

				} else {
					var methods = [];
					locks.forEach( function(lock) {

						methods.push(function(callback) {

							lock.release( function() {
								callback();
							});

						});
					});
					async.parallel(methods, function () {
						http.ServerResponse.prototype.end.apply(this, args);
					}.bind(this));
					
				}

				return;

			}

			http.ServerResponse.prototype.end.apply(this, args);
		}
		next();
	});

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
