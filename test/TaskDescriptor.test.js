/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';

import { createLoader } from '../src';

describe('DataLoaderTaskDescriptor', () => {
  const loader = {
    success: () => null,
    error: () => null,
    fetch: () => null,
  };
  const descriptor = createLoader(loader);

  it('newTask() should return a task', () => {
    expect(descriptor.newTask({}, {
      type: 'USER_REQUEST',
    })).to.be.ok;
  });

  it('newTask() should throw an error when action is invalid', () => {
    expect(() => descriptor.newTask({}, {})).to.throw(Error);
  });

  it('loading -> shouldFetch -> fetch -> success', async () => {
    const loaderObj = {
      fetch: () => 20,
      success: () => ({ type: 'USER_SUCCESS' }),
      error: () => ({ type: 'USER_FAILURE' }),
      loading: () => {},
      shouldFetch: () => true,
    };

    const loadingSpy = sinon.spy(loaderObj, 'loading');
    const shouldFetchSpy = sinon.spy(loaderObj, 'shouldFetch');
    const fetchSpy = sinon.spy(loaderObj, 'fetch');
    const successSpy = sinon.spy(loaderObj, 'success');
    const errorSpy = sinon.spy(loaderObj, 'error');

    const dispatchSpy = sinon.spy();

    const newLoader = createLoader('USER_REQUEST', loaderObj);
    await newLoader.newTask({
      dispatch: dispatchSpy,
    }, {
      type: 'USER_REQUEST',
      payload: {
        userId: 25,
      },
    }).execute({});

    expect(loadingSpy.calledOnce).to.be.true;
    expect(shouldFetchSpy.calledOnce).to.be.true;
    expect(fetchSpy.calledOnce).to.be.true;
    expect(successSpy.calledOnce).to.be.true;
    expect(errorSpy.called).to.be.false;
    sinon.assert.callOrder(shouldFetchSpy, fetchSpy, successSpy);
  });

  it('loading -> shouldFetch(return false) -> noop', async () => {
    const loaderObj = {
      fetch: () => 20,
      success: () => ({ type: 'USER_SUCCESS' }),
      error: () => ({ type: 'USER_FAILURE' }),
      loading: () => {},
      shouldFetch: () => false,
    };

    const loadingSpy = sinon.spy(loaderObj, 'loading');
    const shouldFetchSpy = sinon.spy(loaderObj, 'shouldFetch');
    const fetchSpy = sinon.spy(loaderObj, 'fetch');
    const successSpy = sinon.spy(loaderObj, 'success');
    const errorSpy = sinon.spy(loaderObj, 'error');

    const dispatchSpy = sinon.spy();

    const newLoader = createLoader('USER_REQUEST', loaderObj);
    await newLoader.newTask({
      dispatch: dispatchSpy,
    }, {
      type: 'USER_REQUEST',
      payload: {
        userId: 25,
      },
    }).execute({});
    expect(shouldFetchSpy.calledOnce).to.be.true;
    expect(loadingSpy.called).to.be.false;
    expect(fetchSpy.calledOnce).to.be.false;
    expect(successSpy.called).to.be.false;
    expect(errorSpy.called).to.be.false;
  });

  it('loading -> shouldFetch -> fetch -> error', async () => {
    const loaderObj = {
      fetch: () => Promise.reject('NotFoundError'),
      success: () => {},
      error: (context, err) => ({ type: 'USER_FAILURE', error: err }),
      loading: () => {},
      shouldFetch: () => true,
    };

    const loadingSpy = sinon.spy(loaderObj, 'loading');
    const shouldFetchSpy = sinon.spy(loaderObj, 'shouldFetch');
    const fetchSpy = sinon.spy(loaderObj, 'fetch');
    const successSpy = sinon.spy(loaderObj, 'success');
    const errorSpy = sinon.spy(loaderObj, 'error');

    const dispatchSpy = sinon.spy();

    const newLoader = createLoader('USER_REQUEST', loaderObj);
    await newLoader.newTask({
      dispatch: dispatchSpy,
    }, {
      type: 'USER_REQUEST',
      payload: {
        userId: 25,
      },
    }).execute({});
    expect(loadingSpy.calledOnce).to.be.true;
    expect(shouldFetchSpy.calledOnce).to.be.true;
    expect(fetchSpy.calledOnce).to.be.true;
    expect(successSpy.called).to.be.false;
    expect(errorSpy.calledOnce).to.be.true;
    sinon.assert.callOrder(shouldFetchSpy, fetchSpy, errorSpy);
  });
});
