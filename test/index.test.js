import { expect } from 'chai';
import { describe, it } from 'mocha';

import * as reduxDataLoader from '../src';

describe('expored values', () => {
  it('load() must be exported', () => {
    expect(reduxDataLoader.load).to.be.a('function');
  });

  it('createDataLoaderMiddleware() must be exported', () => {
    expect(reduxDataLoader.createDataLoaderMiddleware).to.be.a('function');
  });

  it('createLoader() must be exported', () => {
    expect(reduxDataLoader.createLoader).to.be.a('function');
  });

  it('action types must be exported', () => {
    expect(reduxDataLoader.LOAD_DATA_SUCCESS_ACTION).to.be.a('string');
    expect(reduxDataLoader.LOAD_DATA_FAILURE_ACTION).to.be.a('string');
    expect(reduxDataLoader.LOAD_DATA_REQUEST_ACTION).to.be.a('string');
  });
});
