/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { isPromise, isAction } from '../src/utils';

describe('utils', () => {
  describe('isPromise()', () => {
    it('Promise.resolve() is a Promise', () => {
      expect(isPromise(Promise.resolve())).to.be.true;
    });

    it('new Promise() is a Promise', () => {
      expect(isPromise(new Promise(resolve => resolve(false)))).to.be.true;
    });
    it('Function is not a Promise', () => {
      expect(isPromise(() => true)).to.not.be.true;
    });
    it('Object is not a Promise', () => {
      expect(isPromise({})).to.not.be.true;
    });
  });

  describe('isAction()', () => {
    it('Object is an action', () => {
      expect(isAction({
        type: 'USER_REQUEST',
        payload: {},
      })).to.be.true;
    });
    it('Object with an empty type is also an action', () => {
      expect(isAction({
        type: '',
      })).to.not.be.true;
    });
    it('Number is not an action', () => {
      expect(isAction(1)).to.not.be.true;
    });
    it('Promise is not an action', () => {
      expect(isAction(Promise.resolve())).to.not.be.true;
    });
    it('Empty object is not an action', () => {
      expect(isAction({})).to.not.be.true;
    });
    it('Function is not an action', () => {
      expect(isAction(() => 1)).to.not.be.true;
    });
  });
});
/* eslint-enable no-unused-expressions */
