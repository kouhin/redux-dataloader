import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import { describe, it } from 'mocha';

import { createLoader, createDataLoaderMiddleware } from '../src';

chai.use(sinonChai);
chai.use(chaiAsPromised);

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
