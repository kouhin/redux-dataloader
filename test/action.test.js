import * as action from '../src/action'
import chai from 'chai'
import { describe, it } from 'mocha'

describe('test actions', () => {
  const requestAction = {
    type: 'LOAD_USER_REQUEST',
    payload: {
      userId: 12
    }
  }

  it('test loadRequest', () => {
    const expect = {
      type: action.LOAD_DATA_REQUEST_ACTION,
      payload: {
        action: requestAction
      }
    }
    const actual = action.loadRequest(requestAction)
    chai.assert.deepEqual(actual, expect)
  })

  it('test loadSuccess', () => {
    const result = {
      userId: 12,
      username: 'tom',
      age: 25
    }
    const expect = {
      type: action.LOAD_DATA_SUCCESS_ACTION,
      payload: {
        data: result
      },
      meta: {
        action: requestAction
      }
    }
    const actual = action.loadSuccess(requestAction, result)
    chai.assert.deepEqual(actual, expect)
  })

  it('test loadFailure', () => {
    const err = new Error('Not Found')
    const expect = {
      type: action.LOAD_DATA_FAILURE_ACTION,
      payload: {
        error: err
      },
      meta: {
        action: requestAction
      },
      error: true
    }
    const actual = action.loadFailure(requestAction, err)
    chai.assert.deepEqual(actual, expect)
  })
})
