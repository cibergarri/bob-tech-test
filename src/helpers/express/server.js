import express from 'express';

const portNumber = process.env.PORT || 3000;
export const data = {};

export const init = async () => {
  return new Promise(async (resolve) => {
    const app = express();
    app.get('/', (req, res) => res.send('Welcome!'));

    const server = app.listen(portNumber, () => {
      console.info('Server listening on port %s!', portNumber);
      data.app = app;
      data.server = server;
      resolve();
    });
  });
};

export const close = async () => {
  return new Promise((resolve) => {
    if (data.server) {
      data.server.close(() => {
        console.info('Server closed');
        resolve();
      });
    } else {
      resolve();
    }
  });
};
