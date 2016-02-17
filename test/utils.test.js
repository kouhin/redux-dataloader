import chai from 'chai'
import { describe, it } from 'mocha'

import { isPromise, isAction } from '../src/utils'

describe('test utils', () => {
  it('test isPromise()', () => {
    chai.expect(isPromise(Promise.resolve())).to.be.true
    chai.expect(isPromise(new Promise((resolve) => resolve(false)))).to.be.true
    chai.expect(isPromise(() => true)).to.not.be.true
    chai.expect(isPromise({})).to.not.be.true
  })

  it('test isAction()', () => {
    chai.expect(isAction({
      type: 'USER_REQUEST',
      payload: {}
    })).to.be.true
    chai.expect(isAction({
      type: ''
    })).to.not.be.true
    chai.expect(isAction(1)).to.not.be.true
    chai.expect(isAction(Promise.resolve())).to.not.be.true
    chai.expect(isAction({})).to.not.be.true
    chai.expect(isAction(() => 1)).to.not.be.true
  })
})
