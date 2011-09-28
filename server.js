var spawn = require('child_process').spawn,
    cluster = require('cluster'),
    start = process.argv[process.argv.length - 1] === 'start',
    czdiscovery = require('czagenda-discovery'),
    config = require('./config');
console.log(config);
var cluster = require('cluster')('./app')
  .use(cluster.logger('logs'))
  .use(cluster.stats())
  .use(cluster.pidfiles('pids'))
  .use(cluster.cli())
  .use(cluster.repl(8888))
  .listen(config.PORT);

console.log(config.IP,config.PORT);
if (start) {
    if (cluster.isMaster) {
      var a = new czdiscovery.Advertisement('http-api',config.IP,config.PORT);
      a.start();
      cluster.on('closing',function() {console.log('stop');a.stop});
    }
    var node = process.execPath,
        cmd = process.argv.slice(1, -1);
    spawn(node, cmd, { env : process.env, setsid: true });
    process.exit(0);
}



