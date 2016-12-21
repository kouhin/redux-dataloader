import { expect } from 'chai';
import { describe, it } from 'mocha';

import { load, LOAD_DATA_REQUEST_ACTION } from '../src';

describe('load()', () => {
  const requestAction = {
    type: 'LOAD_USER_REQUEST',
    payload: {
      userId: 12,
    },
  };

  it('wrap an action, should return promise', (done) => {
    const promise = load(requestAction);
    const expected = {
      type: LOAD_DATA_REQUEST_ACTION,
      meta: {
        action: requestAction,
      },
    };
    promise.then((result) => {
      expect(result).to.be.deep.equal(expected);
      done();
    }, done);
  });

  it('pass a non-object to load(), should throw an Error', () => {
    function action() {}
    expect(() => load(action)).to.throw(Error);
  });
});
