var spawn = require('child_process').spawn,
    cluster = require('cluster'),
    start = process.argv[process.argv.length - 1] === 'start',
    czdiscovery = require('czagenda-discovery'),
    settings = require('./settings');

if (start) {
  var node = process.execPath,
      cmd = process.argv.slice(1, -1);
  if(process.platform !== 'darwin') {
		spawn(node, cmd, { env : process.env, setsid: true });
		process.exit(0);
	}
}

var server_cluster = require('cluster')('./app')
  .use(cluster.logger('logs'))
  .use(cluster.stats())
  .use(cluster.pidfiles('pids'))
  .use(cluster.cli())
  .use(cluster.repl(8888));

if( process.env.NODE_ENV==='development') {
  server_cluster.use(cluster.reload());
}
  
server_cluster.listen(settings.server.port);

if(settings.czdiscovery.enabled) {
	var a = null;
	server_cluster.on('closing',function() {
	    a.stop();
	});
	server_cluster.on('start',function() {
		a = new czdiscovery.Advertisement(settings.czdiscovery.key,settings.server.host,settings.server.port);
		a.start();
	});
}	

