var http = require('http');

function Rest (host, port) {

	if(typeof(host) === 'undefined' || host === null) {
		host = '127.0.0.1';
	}

	if(typeof(port) === 'undefined' || port === null) {
		port = 3000;
	}

	this.__host = host;
	this.__port = port;

}

Rest.prototype.request = function(options, data, callback) {
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
	
	req.end();
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
