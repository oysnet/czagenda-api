var http = require('http');
config = require('./config');

module.exports = http.createServer(function(req, res){
  console.log('%s %s', req.method, req.url);
  var body = 'Hello World '+config.IP;
  res.writeHead(200, { 'Content-Length': body.length });
  res.end(body);
});
