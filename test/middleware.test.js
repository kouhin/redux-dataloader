import { expect } from 'chai';
import { describe, it } from 'mocha';

import { createLoader, createDataLoaderMiddleware } from '../src';

describe('createDataLoaderMiddleware()', () => {
  const loaderObj = {
    success: () => {},
    error: () => {},
    fetch: () => {},
  };

  const loader = createLoader(loaderObj);

  const extraSymbol = 'Extra';
  const nextHandler = createDataLoaderMiddleware([loader], extraSymbol);

  it('createDataLoaderMiddleware() should return a function to handle next', () => {
    expect(nextHandler).to.be.a('function');
    expect(nextHandler.length).to.be.equal(1);
  });
});
