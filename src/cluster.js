import cluster from 'cluster';
import { run } from './index';
import { logger } from './helpers/winston/log';

const MAX_NUMBER_RESTARTS = process.env.MAX_NUMBER_RESTARTS || 12;
let restarts = 0;

if (cluster.isMaster) {
  masterProcess();
} else {
  childProcess();
}

function masterProcess () {
  const numCPUs = process.env.numCPUs || 1;
  logger.info(`Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    logger.info(`Forking process number ${i}...`);
    forkChild();
  }
}

function forkChild () {
  return cluster.fork()
    .on('exit', (worker, code, signal) => {
      restarts += 1;
      logger.warn(`worker died. Restart Number ${restarts}`);
      if (restarts > MAX_NUMBER_RESTARTS) {
        logger.error('Worker restarted too many times. No restarting any more');
      } else {
        logger.warn('restarting...');
        //   worker.process.pid, signal || code)
        forkChild();
      }
    });
}

function childProcess () {
  logger.info(`child ${process.pid} is running`);
  run();
}
