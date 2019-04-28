import sinon from 'sinon';
import mongoose from 'mongoose';
import { logger } from '../../src/helpers/winston/log';

export const getMoongoseConnectStub = () => sinon
  .stub(mongoose, 'connect')
  .callsFake(() => {
    logger.info('mongoose connection mocked');
  });
