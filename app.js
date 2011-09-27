var http = require('http');
var mdns = require('mdns');
var ad = mdns.createAdvertisement('api-http', 3000);
ad.start()


module.exports = http.createServer(function(req, res){
  console.log('%s %s', req.method, req.url);
  var body = 'Hello World 2';
  res.writeHead(200, { 'Content-Length': body.length });
  res.end(body);
});
