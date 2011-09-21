var cluster = require('cluster'),
    start = process.argv[process.argv.length - 1] === 'start';

if (start) {
    var node = process.execPath,
        cmd = process.argv.slice(1, -1);

    spawn(node, cmd, { env : process.env, setsid: true });
    process.exit(0);
}


cluster('./app')
  .use(cluster.logger('logs'))
  .use(cluster.stats())
  .use(cluster.pidfiles('pids'))
  .use(cluster.cli())
  .use(cluster.repl(8888))
  .listen(3000);
