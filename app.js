var log = require('util').log;
// ##################################################################################
// VALIDATOR INITIALISATION
// ##################################################################################
/*var validatorEnvironment = require('./libs/schemas/validator').validatorEnvironment;
log('Loading validatorEnvironment');
validatorEnvironment.load(function(err, success) {
	if(err !== null) {
		console.error(err);
	} else {
		init_server();
	}
})*/
// ##################################################################################
// HTTP SERVER INITIALISATION
// ##################################################################################
var server = require('./libs/server.js');
var init_server = function() {
	server.get('/', function(req, res) {
		res.end('It works !');
	});
	require('./libs/rest').setup(server)
}
init_server();
module.exports = server;
/*
var io = require('socket.io').listen(server);
var sockets = [];
io.sockets.on('connection', function (socket) {
	
  sockets.push(socket);
	
  socket.on('disconnect', function () {
    delete sockets[sockets.indexOf(socket)]
  });
});

var sys = require("sys");
var writeStats = require('./libs/stats.js').writeStats;
setInterval( function () {
		
	for (var i = 0, l = sockets.length;i<l;i++) {
		try {
			sockets[i].volatile.emit('stats', {write : writeStats.read()});
		} catch (e) {
			//
		}
	}
	
} ,100)
*/