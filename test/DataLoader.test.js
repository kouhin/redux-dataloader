import chai from 'chai'
import sinonChai from 'sinon-chai'
import chaiAsPromised from 'chai-as-promised'
import { describe, it } from 'mocha'
import sinon from 'sinon'

import { createLoader } from '../src'

chai.should()
chai.use(sinonChai)
chai.use(chaiAsPromised)

describe('test createLoader: action matcher', () => {
  const loader = {
    success: () => {
      return null
    },
    error: () => {
      return null
    },
    remote: () => {
      return null
    }
  }
  const requestAction = {
    type: 'USER_REQUEST',
    payload: {
      userId: 25
    }
  }
  it('create a loader that matches string', () => {
    const descriptor = createLoader('USER_REQUEST', loader)
    chai.expect(descriptor.supports(requestAction)).to.be.true
    chai.expect(descriptor.supports('USER_REQUEST')).to.not.be.true
    chai.expect(descriptor.supports({
      type: 'USER_SUCCESS'
    })).to.not.be.true
  })

  it('create a data loader that matches action', () => {
    const descriptor = createLoader(requestAction, loader)
    chai.expect(descriptor.supports(requestAction)).to.be.true
    chai.expect(descriptor.supports('USER_REQUEST')).to.not.be.true
    chai.expect(descriptor.supports({
      type: 'USER_SUCCESS'
    })).to.not.be.true
    chai.expect(descriptor.supports({
      type: 'USER_REQUEST',
      payload: {
        userId: 25
      }
    })).to.be.true
  })

  it('create a data loader that uses function to match', () => {
    const descriptor = createLoader((action) =>
      (action.payload && action.type && action.type === 'USER_REQUEST'), loader)
    chai.expect(descriptor.supports(requestAction)).to.be.true
    chai.expect(descriptor.supports('USER_REQUEST')).to.not.be.true
    chai.expect(descriptor.supports({
      type: 'USER_SUCCESS'
    })).to.not.be.true
    chai.expect(descriptor.supports({
      type: 'USER_REQUEST'
    })).to.not.be.true
    chai.expect(descriptor.supports({
      type: 'USER_REQUEST',
      payload: {
      }
    })).to.be.true
  })

  it('check created descriptor', () => {
    const descriptor = createLoader('USER_REQUEST', loader)
    chai.expect(descriptor.pattern).to.equal('USER_REQUEST')
    chai.expect(descriptor.ttl).to.equal(10000)
    chai.expect(descriptor.params).to.deep.equal(loader)
  })

  it('set ttl in descriptor', () => {
    const descriptor = createLoader('USER_REQUEST', loader, { ttl: 100 })
    chai.expect(descriptor.ttl).to.equal(100)
  })
})

describe('test createLoader: DataLoderTask', () => {
  const loader = {
    success: (context, data) => {
      return null
    },
    error: (context, error) => {
      return null
    },
    remote: (context) => {
      return null
    }
  }
  const descriptor = createLoader(loader)

  it('newTask() should return a task', () => {
    chai.expect(descriptor.newTask({}, {
      type: 'USER_REQUEST'
    })).to.be.ok
  })

  it('newTask() should throw an error when action is invalid', () => {
    chai.expect(() => descriptor.newTask({}, {})).to.throw(Error)
  })

  it('loading -> shouldFetch -> local -> remote -> success', (done) => {
    const loaderObj = {
      local: () => null,
      remote: () => 20,
      success: () => { return {type: 'USER_SUCCESS'} },
      error: () => { return {type: 'USER_FAILURE'} },
      loading: () => {},
      shouldFetch: () => {
        return true
      }
    }

    const loadingSpy = sinon.spy(loaderObj, 'loading')
    const shouldFetchSpy = sinon.spy(loaderObj, 'shouldFetch')
    const localSpy = sinon.spy(loaderObj, 'local')
    const remoteSpy = sinon.spy(loaderObj, 'remote')
    const successSpy = sinon.spy(loaderObj, 'success')
    const errorSpy = sinon.spy(loaderObj, 'error')

    const dispatchSpy = sinon.spy()

    const loader = createLoader('USER_REQUEST', loaderObj)
    const promise = loader.newTask({
      dispatch: dispatchSpy
    }, {
      type: 'USER_REQUEST',
      payload: {
        userId: 25
      }
    }).execute()
    promise.should.be.fulfilled.then(() => {
      loadingSpy.should.have.been.calledOnce
      shouldFetchSpy.should.have.been.calledOnce
      localSpy.should.have.been.calledOnce
      remoteSpy.should.have.been.calledOnce
      successSpy.should.have.been.calledOnce
      errorSpy.should.have.not.been.called
      sinon.assert.callOrder(shouldFetchSpy, localSpy, remoteSpy, successSpy)
    }).should.notify(done)
  })

  it('loading -> shouldFetch -> local -> success', (done) => {
    const loaderObj = {
      local: () => 30,
      remote: () => 20,
      success: () => { return {type: 'USER_SUCCESS'} },
      error: () => { return {type: 'USER_FAILURE'} },
      loading: () => {},
      shouldFetch: () => {
        return true
      }
    }

    const loadingSpy = sinon.spy(loaderObj, 'loading')
    const shouldFetchSpy = sinon.spy(loaderObj, 'shouldFetch')
    const localSpy = sinon.spy(loaderObj, 'local')
    const remoteSpy = sinon.spy(loaderObj, 'remote')
    const successSpy = sinon.spy(loaderObj, 'success')
    const errorSpy = sinon.spy(loaderObj, 'error')

    const dispatchSpy = sinon.spy()

    const loader = createLoader('USER_REQUEST', loaderObj)
    const promise = loader.newTask({
      dispatch: dispatchSpy
    }, {
      type: 'USER_REQUEST',
      payload: {
        userId: 25
      }
    }).execute()
    promise.should.be.fulfilled.then(() => {
      loadingSpy.should.have.been.calledOnce
      shouldFetchSpy.should.have.been.calledOnce
      localSpy.should.have.been.calledOnce
      remoteSpy.should.have.not.been.calledOnce
      successSpy.should.have.been.calledOnce
      errorSpy.should.have.not.been.called
      sinon.assert.callOrder(shouldFetchSpy, localSpy, successSpy)
    }).should.notify(done)
  })

  it('loading -> shouldFetch -> local -> remote -> error', (done) => {
    const loaderObj = {
      local: () => null,
      remote: () => Promise.reject('NotFoundError'),
      success: () => { },
      error: (context, err) => { return {type: 'USER_FAILURE', error: err} },
      loading: () => {},
      shouldFetch: () => {
        return true
      }
    }

    const loadingSpy = sinon.spy(loaderObj, 'loading')
    const shouldFetchSpy = sinon.spy(loaderObj, 'shouldFetch')
    const localSpy = sinon.spy(loaderObj, 'local')
    const remoteSpy = sinon.spy(loaderObj, 'remote')
    const successSpy = sinon.spy(loaderObj, 'success')
    const errorSpy = sinon.spy(loaderObj, 'error')

    const dispatchSpy = sinon.spy()

    const loader = createLoader('USER_REQUEST', loaderObj)
    const promise = loader.newTask({
      dispatch: dispatchSpy
    }, {
      type: 'USER_REQUEST',
      payload: {
        userId: 25
      }
    }).execute()
    promise.should.be.fulfilled.then(() => {
      loadingSpy.should.have.been.calledOnce
      shouldFetchSpy.should.have.been.calledOnce
      localSpy.should.have.been.calledOnce
      remoteSpy.should.have.been.calledOnce
      successSpy.should.have.not.been.called
      errorSpy.should.have.been.calledOnce
      sinon.assert.callOrder(shouldFetchSpy, localSpy, remoteSpy, errorSpy)
    }).should.notify(done)
  })
})
