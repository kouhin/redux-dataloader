/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { createLoader } from '../src';

describe('createLoader', () => {
  const loader = {
    success: () => null,
    error: () => null,
    fetch: () => null,
  };
  const requestAction = {
    type: 'USER_REQUEST',
    payload: {
      userId: 25,
    },
  };
  it('create a loader that matches string', () => {
    const descriptor = createLoader('USER_REQUEST', loader);
    expect(descriptor.supports(requestAction)).to.be.equal(true);
    expect(descriptor.supports('USER_REQUEST')).to.not.be.equal(true);
    expect(descriptor.supports({
      type: 'USER_SUCCESS',
    })).to.not.be.equal(true);
  });

  it('create a data loader that matches action', () => {
    const descriptor = createLoader(requestAction, loader);
    expect(descriptor.supports(requestAction)).to.be.equal(true);
    expect(descriptor.supports('USER_REQUEST')).to.not.be.equal(true);
    expect(descriptor.supports({
      type: 'USER_SUCCESS',
    })).to.not.be.equal(true);
    expect(descriptor.supports({
      type: 'USER_REQUEST',
      payload: {
        userId: 25,
      },
    })).to.be.equal(true);
  });

  it('create a data loader that uses function to match', () => {
    const descriptor = createLoader(action =>
      (action.payload && action.type && action.type === 'USER_REQUEST'), loader);
    expect(descriptor.supports(requestAction)).to.be.equal(true);
    expect(descriptor.supports('USER_REQUEST')).to.not.be.equal(true);
    expect(descriptor.supports({
      type: 'USER_SUCCESS',
    })).to.not.be.equal(true);
    expect(descriptor.supports({
      type: 'USER_REQUEST',
    })).to.not.be.equal(true);
    expect(descriptor.supports({
      type: 'USER_REQUEST',
      payload: {
      },
    })).to.be.equal(true);
  });

  it('Descriptor should has default options', () => {
    const descriptor = createLoader(requestAction, loader);
    expect(descriptor.options.ttl).to.equal(10000);
    expect(descriptor.options.retryTimes).to.equal(1);
    expect(descriptor.options.retryWait(1)).to.equal(0);
  });
});
/* eslint-enable no-unused-expressions */
