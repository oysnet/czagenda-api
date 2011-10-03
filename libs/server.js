
/**
 * Module dependencies.
 */
var log = require('czagenda-log').from(__filename);
var express = require('express');
//var oauth = require('node-express-oauth');
var cors = require('./cors.js');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.use(cors); 
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);  
});
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
/*
    var verifyOAuthRequest = [
        oauth.verifyBody(),
        oauth.verifySignature(function (req, type, identifier, callback) {
        	console.log('type ' + type + ' ' + identifier) ;
            if (type=='client') {
            	callback('6bbtx2GEy2AW9mkFfmra2bBhrgSw4hPe');
            }
            if (type=='token') {
            	callback('37DgHruB8pdX6wtMURYZ6kvqrGFuuKR5');
            }
            
           // callback();
        })
    ];

    app.post('/test', verifyOAuthRequest, function (req, res) {
    	console.log(req);
        res.end('toto');
    });
*/

