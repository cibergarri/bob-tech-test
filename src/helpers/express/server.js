import express from 'express';
import bodyParser from 'body-parser';
import { initializeDb } from '../mongo/db';
import { logger } from '../winston/log';
import { initializeSocket } from '../socket/socket-helper';
import { routes } from './routes';

const portNumber = process.env.PORT || 3000;
export const data = {};

export const init = async () => {
  return new Promise(async (resolve) => {
    await initializeDb();
    const app = express();
    app.use(bodyParser.urlencoded({ extended: true, limit: '16mb' }));
    app.use(bodyParser.json({ limit: '16mb' }));
    app.get('/', (req, res) => res.send('Welcome!'));
    app.use(routes);
    const server = app.listen(portNumber, () => {
      logger.info('Server listening on port %s!', portNumber);
      data.app = app;
      data.socket = initializeSocket(server);
      data.server = server;
      resolve();
    });
  });
};

export const close = async () => {
  return new Promise((resolve) => {
    if (data.server) {
      data.server.close(() => {
        logger.info('Server closed');
        resolve();
      });
    } else {
      resolve();
    }
  });
};
