import { expect } from 'chai';
import { describe, it } from 'mocha';

import * as action from '../src/action';

describe('test actions', () => {
  const requestAction = {
    type: 'LOAD_USER_REQUEST',
    payload: {
      userId: 12,
    },
  };

  it('test loadRequest', () => {
    const expected = {
      type: action.LOAD_DATA_REQUEST_ACTION,
      payload: {
        action: requestAction,
      },
    };
    const actual = action.loadRequest(requestAction);
    expect(actual).to.deep.equal(expected);
  });

  it('test loadSuccess', () => {
    const result = {
      userId: 12,
      username: 'tom',
      age: 25,
    };
    const expected = {
      type: action.LOAD_DATA_SUCCESS_ACTION,
      payload: {
        data: result,
      },
      meta: {
        action: requestAction,
      },
    };
    const actual = action.loadSuccess(requestAction, result);
    expect(actual).to.deep.equal(expected);
  });

  it('test loadFailure', () => {
    const err = new Error('Not Found');
    const expected = {
      type: action.LOAD_DATA_FAILURE_ACTION,
      payload: {
        error: err,
      },
      meta: {
        action: requestAction,
      },
      error: true,
    };
    const actual = action.loadFailure(requestAction, err);
    expect(actual).to.deep.equal(expected);
  });
});
