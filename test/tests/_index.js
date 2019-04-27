/* global before, after, it */
// eslint-disable-next-line no-unused-vars
import { chai } from '../helpers/chai';
import { init, data, close } from '../../src/helpers/express/server';

before(async () => {
  console.info('executing pre-tests code');
  // initialize app / do global stubs here
  await init();
});

it('should have started the app', () => {
  (!!data.app).should.be.eq(true);
  (!!data.server).should.be.eq(true);
  data.server.should.be.a('object');
});

after(async () => {
  // close app / reset global stubs
  await close();
  console.info('post-tests code executed');
});
