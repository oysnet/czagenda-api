var log = require('czagenda-log').from(__filename);
var lastSeen = require('./libs/lastSeen');

// ##################################################################################
// HTTP SERVER INITIALISATION
// ##################################################################################
var server = require('./libs/server.js');
var init_server = function() {
	server.get('/', function(req, res) {
		res.end('It works !');
	});
	require('./libs/rest').setup(server);
}
//init_server();
module.exports = server;

// ##################################################################################
// VALIDATOR INITIALISATION
// ##################################################################################
var validator = require('./libs/schemas/validator');

validator.approvedEnvironment.load( function(err, success) {
	if(err !== null) {
		log.critical('ValidatorEnvironment failed to load', err);
		throw err;
	} else {
		log.notice('ValidatorEnvironment loaded');
		init_server();
		lastSeen.start();
	}
})


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