import chai from 'chai'
import sinonChai from 'sinon-chai'
import chaiAsPromised from 'chai-as-promised'
import { describe, it } from 'mocha'

import { createLoader, createDataLoaderMiddleware } from '../src'

chai.should()
chai.use(sinonChai)
chai.use(chaiAsPromised)

describe('test createDataLoaderMiddleware()', () => {
  const loaderObj = {
    success: () => {
    },
    error: () => {
    },
    remote: () => {
    }
  }

  const loader = createLoader(loaderObj)

  const extraSymbol = 'Extra'
  const nextHandler = createDataLoaderMiddleware([loader], extraSymbol)

  it('must return a function to handle next', () => {
    chai.expect(nextHandler).to.be.a('function')
    chai.expect(nextHandler.length).to.be.equal(1)
  })
})
