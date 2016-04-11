/* eslint-disable no-unused-expressions */
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import { describe, it } from 'mocha';
import sinon from 'sinon';

import { createLoader } from '../src';

chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('test createLoader: action matcher', () => {
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
    const descriptor = createLoader((action) =>
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
});

describe('test createLoader: DataLoderTask', () => {
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

  it('loading -> shouldFetch -> fetch -> success', (done) => {
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
    const promise = newLoader.newTask({
      dispatch: dispatchSpy,
    }, {
      type: 'USER_REQUEST',
      payload: {
        userId: 25,
      },
    }).execute();

    return promise.should.be.fulfilled.then(() => {
      loadingSpy.should.have.been.calledOnce;
      shouldFetchSpy.should.have.been.calledOnce;
      fetchSpy.should.have.been.calledOnce;
      successSpy.should.have.been.calledOnce;
      errorSpy.should.have.not.been.called;
      sinon.assert.callOrder(shouldFetchSpy, fetchSpy, successSpy);
    }).should.notify(done);
  });

  it('loading -> shouldFetch(return false) -> noop', (done) => {
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
    const promise = newLoader.newTask({
      dispatch: dispatchSpy,
    }, {
      type: 'USER_REQUEST',
      payload: {
        userId: 25,
      },
    }).execute();
    return promise.should.be.fulfilled.then(() => {
      shouldFetchSpy.should.have.been.calledOnce;
      loadingSpy.should.have.not.been.called;
      fetchSpy.should.have.not.been.calledOnce;
      successSpy.should.have.not.been.called;
      errorSpy.should.have.not.been.called;
    }).should.notify(done);
  });

  it('loading -> shouldFetch -> fetch -> error', (done) => {
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
    const promise = newLoader.newTask({
      dispatch: dispatchSpy,
    }, {
      type: 'USER_REQUEST',
      payload: {
        userId: 25,
      },
    }).execute();
    return promise.should.be.fulfilled.then(() => {
      loadingSpy.should.have.been.calledOnce;
      shouldFetchSpy.should.have.been.calledOnce;
      fetchSpy.should.have.been.calledOnce;
      successSpy.should.have.not.been.called;
      errorSpy.should.have.been.calledOnce;
      sinon.assert.callOrder(shouldFetchSpy, fetchSpy, errorSpy);
    }).should.notify(done);
  });
});
/* eslint-enable no-unused-expressions */
