/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { isPromise, isAction } from '../src/utils';

describe('test utils', () => {
  it('test isPromise()', () => {
    expect(isPromise(Promise.resolve())).to.be.true;
    expect(isPromise(new Promise((resolve) => resolve(false)))).to.be.true;
    expect(isPromise(() => true)).to.not.be.true;
    expect(isPromise({})).to.not.be.true;
  });

  it('test isAction()', () => {
    expect(isAction({
      type: 'USER_REQUEST',
      payload: {},
    })).to.be.true;
    expect(isAction({
      type: '',
    })).to.not.be.true;
    expect(isAction(1)).to.not.be.true;
    expect(isAction(Promise.resolve())).to.not.be.true;
    expect(isAction({})).to.not.be.true;
    expect(isAction(() => 1)).to.not.be.true;
  });
});
/* eslint-enable no-unused-expressions */
