//var http = require('http');

var settings = require('../settings');

function Rest (host, port) {

	if(typeof(host) === 'undefined' || host === null) {
		host = 'localhost';
	}

	if(typeof(port) === 'undefined' || port === null) {
		port = 3000;
	}

	
	this.__url = "http://"+ host + ":" + port;
	
	this.token = settings.oauth.access_token;
	this.token_secret = settings.oauth.access_secret;
	
	var consumer= settings.oauth.consumer_token;
	var consumer_secret = settings.oauth.consumer_secret;
	
	var OAuth= require('node-oauth').OAuth;
	this.client= new OAuth("","",consumer,consumer_secret,"1.0",null,"HMAC-SHA1")
	                  
	
	
}


Rest.prototype._callback = function (callback, err, data, response) {
	callback(err, response, data);
}


Rest.prototype.request = function(options, data, callback) {
	
	if (options.method === 'POST') {
		this.client.post(this.__url + options.path, this.token, this.token_secret, data, 'application/json', this._callback.bind(this, callback))
	} else if (options.method === 'PUT') {
		this.client.put(this.__url + options.path, this.token, this.token_secret, data, 'application/json', this._callback.bind(this, callback))
	}
	else {
		this.client.getProtectedResource(this.__url + options.path, options.method, this.token, this.token_secret,  this._callback.bind(this, callback));
	}
	
	
	
	/*
	var req = http.request(options, function(res) {
		
		var data = null;
		
		res.setEncoding('utf8');
		res.on('data', function(chunk) {
			
			if (data === null) {
				data = chunk;
			} else {
				data += chunk;
			}
			
			//callback(null, res, chunk);
		});
		
		res.on('end', function() {
			callback(null, res, data);
		});
		
	});
	req.on('error', function(e) {
		callback(e)
	});
	
	if (data !== null) {
		req.write(data);
	}
	
	req.end();*/
}

Rest.prototype.get = function(path, callback) {
	var options = {
		host : this.__host,
		port : this.__port,
		path : path,
		method : 'GET'
	};
	
	this.request(options, null, callback)
}

Rest.prototype.post = function(path, data, callback) {
	var options = {
		host : this.__host,
		port : this.__port,
		path : path,
		method : 'POST',
		headers : {
			 'Content-Type': 'application/json',
          	 'Content-Length': data.length
		}
	};
	this.request(options, data, callback)
}

Rest.prototype.put = function(path, data, callback) {
	var options = {
		host : this.__host,
		port : this.__port,
		path : path,
		method : 'PUT',
		headers : {
			 'Content-Type': 'application/json',
          	 'Content-Length': data.length
		}
	};
	this.request(options, data, callback)
}

Rest.prototype.del = function(path, callback) {
	var options = {
		host : this.__host,
		port : this.__port,
		path : path,
		method : 'DELETE'
	};
	this.request(options, null, callback)
}

exports.Rest = Rest;
