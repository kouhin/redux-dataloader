import isEqual from 'lodash/isEqual'

import { loadFailure, loadSuccess } from './action'
import { isAction } from './utils'

/**
 * Create a new DataLoaderDescriptor
 *
 * @param {string|object|function} pattern pattern to match action
 * @param {object} params parameters
 * @param {object} options options
 * @returns {DataLoaderTaskDescriptor} a descriptor object for creating data loader
 */
function createLoader (pattern, params, options) {
  return new DataLoaderTaskDescriptor(pattern, params, options)
}

class DataLoaderTaskDescriptor {
  constructor (pattern, params, options = {}) {
    this.pattern = pattern
    this.params = params
    this.ttl = options.ttl || 10000 // Default TTL: 10s
  }

  supports (action) {
    switch (typeof this.pattern) {
      case 'object':
        return isEqual(this.pattern, action)
      case 'function':
        return this.pattern(action) === true
      default:
        return this.pattern === action.type
    }
  }

  newTask (context, action) {
    const worker = new DataLoaderTask(context, action, this.params)
    return worker
  }
}

class DataLoaderTask {
  constructor (context, action, params = {}) {
    if (!isAction(action)) {
      throw new Error('action must be a plain object')
    }

    this.context = {
      ...context,
      action
    }

    this.action = action

    this.params = {
      success ({ action }) {
        throw new Error('success() is not implemented', action.type)
      },
      error ({ action }) {
        throw new Error('error() is not implemented', action.type)
      },
      loading ({ dispatch, action }) {
        return action;
      },
      shouldFetch () {
        return true
      },
      async fetch ({ action }) {
        throw new Error('Not implemented', action)
      },
      ...params
    }
  }

  async execute () {
    if (!this.params.shouldFetch(this.context)) {
      this.context.dispatch(loadSuccess(this.action)) // load nothing
      return null;
    }
    this.context.dispatch(this.params.loading(this.context));
    try {
      const result = await this.params.fetch(this.context);
      const successAction = this.params.success(this.context, result)
      if (successAction.type === this.action.type) {
        throw new Error('Result action type equals origial action type', this.action)
      }
      this.context.dispatch(successAction)
      this.context.dispatch(loadSuccess(this.action, result))
      return successAction;
    } catch (error) {
      const errorAction = this.params.error(this.context, error)
      if (errorAction.type === this.action.type) {
        throw new Error('Result action type equals origial action type', this.action)
      }
      this.context.dispatch(errorAction)
      this.context.dispatch(loadFailure(this.action, error))
      return errorAction
    }
  }
}

export default createLoader
