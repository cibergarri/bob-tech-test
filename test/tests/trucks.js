/* global before, describe, afterEach, it */
import sinon from 'sinon';
import { chai } from '../helpers/chai';
import { data } from '../../src/helpers/express/server';
import { Truck } from '../../src/models/truck';
import * as dbHelper from '../../src/helpers/mongo/dbHelper';

describe('Trucks', () => {
  let sandbox;
  before(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox && sandbox.restore();
  });
  it('should get the trucks from db', (done) => {
    const mockResult = [];
    const findTrucksStub = sandbox
      .stub(dbHelper, 'find')
      .resolves({ doc: mockResult });

    chai.request(data.app)
      .get('/api/trucks')
      .set('Content-Type', 'application/json')
      .end((err, res) => {
        if (err) done(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        chai.expect(res.body).to.deep.equal(mockResult);
        findTrucksStub
          .withArgs(Truck)
          .callCount
          .should.equal(1, 'database should be called');
        done();
      });
  });
});
