/* global before, after, it */
// eslint-disable-next-line no-unused-vars
import { chai } from '../helpers/chai';
import { init, data, close } from '../../src/helpers/express/server';
import { logger } from '../../src/helpers/winston/log';
import { getMoongoseConnectStub } from '../helpers/stubs';

chai.use(require('chai-http'));
chai.should();

let moongoseConnectStub;
before(async () => {
  logger.info('executing pre-tests code');
  // initialize app / do global stubs here
  moongoseConnectStub = getMoongoseConnectStub();
  await init();
});

it('should have started the app', () => {
  (!!data.app).should.be.eq(true);
  (!!data.server).should.be.eq(true);
  data.server.should.be.a('object');
});

after(async () => {
  // close app / reset global stubs
  moongoseConnectStub.restore();
  await close();
  logger.info('post-tests code executed');
});
