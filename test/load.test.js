import chai from 'chai'
import { describe, it } from 'mocha'

import { load, LOAD_DATA_REQUEST_ACTION } from '../src'

describe('test load()', () => {
  const requestAction = {
    type: 'LOAD_USER_REQUEST',
    payload: {
      userId: 12
    }
  }

  it('wrap an action, should return promise', () => {
    const promise = load(requestAction)
    const expect = {
      type: LOAD_DATA_REQUEST_ACTION,
      payload: {
        action: requestAction
      }
    }
    chai.assert.eventually.deepEqual(promise, expect)
  })

  it('pass a non-object to load(), should throw an Error', () => {
    const action = function () {}
    chai.expect(() => load(action)).to.throw(Error)
  })
})
