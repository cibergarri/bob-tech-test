import { init } from './helpers/express/server';

const run = async () => {
  try {
    await init();
    console.info('App initialized');
  } catch (err) {
    console.error('Error initializing app');
  }
};

run();
