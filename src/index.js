import { init } from './helpers/express/server';
import { logger } from './helpers/winston/log';

export const run = async () => {
  try {
    await init();
    logger.info('App initialized');
    // const person = new Person({ name: 'test' });
    // await person.save();
    // logger.info('person saved');
  } catch (err) {
    logger.error('Error initializing app');
  }
};
