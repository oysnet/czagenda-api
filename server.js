var spawn = require('child_process').spawn,
    cluster = require('cluster'),
    start = process.argv[process.argv.length - 1] === 'start',
    czdiscovery = require('czagenda-discovery'),
    config = require('./settings').server;

if (start) {
  var node = process.execPath,
      cmd = process.argv.slice(1, -1);
  spawn(node, cmd, { env : process.env, setsid: true });
  process.exit(0);
}

var cluster = require('cluster')('./app')
  .use(cluster.logger('logs'))
  .use(cluster.stats())
  .use(cluster.pidfiles('pids'))
  .use(cluster.cli())
  .use(cluster.repl(8888))
  .listen(config.port);

var a = null;
cluster.on('closing',function() {
    a.stop();
});
cluster.on('start',function() {
	a = new czdiscovery.Advertisement('http-api',config.ip,config.port);
	a.start();
});
