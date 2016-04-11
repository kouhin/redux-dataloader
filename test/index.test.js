import chai from 'chai';
import { describe, it } from 'mocha';

import * as reduxDataLoader from '../src';

describe('expored values', () => {
  it('load() must be exported', () => {
    chai.assert.isFunction(reduxDataLoader.load);
  });

  it('createDataLoaderMiddleware() must be exported', () => {
    chai.assert.isFunction(reduxDataLoader.createDataLoaderMiddleware);
  });

  it('createLoader() must be exported', () => {
    chai.assert.isFunction(reduxDataLoader.createLoader);
  });

  it('action types must be exported', () => {
    chai.assert.isString(reduxDataLoader.LOAD_DATA_REQUEST_ACTION);
    chai.assert.isString(reduxDataLoader.LOAD_DATA_SUCCESS_ACTION);
    chai.assert.isString(reduxDataLoader.LOAD_DATA_FAILURE_ACTION);
  });
});
