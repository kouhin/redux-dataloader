import isEqual from 'lodash/isEqual';

import { loadFailure, loadSuccess } from './action';
import { isAction } from './utils';
import { fixedWait } from './wait-strategies';

class DataLoaderTask {
  constructor(context, monitoredAction, params = {}, options = {}) {
    if (!isAction(monitoredAction)) {
      throw new Error('action must be a plain object');
    }

    this.context = {
      ...context,
      monitoredAction,
    };

    this.action = monitoredAction;

    this.params = {
      success({ action }) {
        throw new Error('success() is not implemented', action.type);
      },
      error({ action }) {
        throw new Error('error() is not implemented', action.type);
      },
      loading({ action }) {
        return action;
      },
      shouldFetch() {
        return true;
      },
      async fetch({ action }) {
        throw new Error('Not implemented', action);
      },
      ...params,
    };

    this.options = {
      ttl: 10000, // Default TTL: 10s
      retryTimes: 1,
      retryWait: fixedWait(0),
      ...options,
    };
    if (this.options.retryTimes < 1) {
      this.options.retryTimes = 1;
    }
  }

  async execute() {
    if (!this.params.shouldFetch(this.context)) {
      this.context.dispatch(loadSuccess(this.action)); // load nothing
      return null;
    }
    this.context.dispatch(this.params.loading(this.context));
    let currentRetry = 0;
    let result;
    let error;

    function sleep(ms = 0) {
      return new Promise(r => setTimeout(r, ms));
    }
    for (;;) {
      try {
        result = await this.params.fetch(this.context);
        break;
      } catch (ex) {
        currentRetry++;
        if (this.options.retryTimes && currentRetry < this.options.retryTimes) {
          await sleep(this.options.retryWait.next().value);
          continue;
        }
        error = ex;
        break;
      }
    }
    if (!error) {
      const successAction = this.params.success(this.context, result);

      // Check successAction
      if (successAction.type === this.action.type) {
        const errorAction = this.params.error(
          this.context,
          new Error('Result action type equals origial action type', this.action)
        );
        this.context.dispatch(errorAction);
        this.context.dispatch(loadFailure(this.action, error));
        return errorAction;
      }

      this.context.dispatch(successAction);
      this.context.dispatch(loadSuccess(this.action, result));
      return successAction;
    }

    const errorAction = this.params.error(this.context, error);

    // Check errorAction
    if (errorAction.type === this.action.type) {
      this.context.dispatch(errorAction);
      this.context.dispatch(loadFailure(this.action, error));
      return errorAction;
    }

    this.context.dispatch(errorAction);
    this.context.dispatch(loadFailure(this.action, error));
    return errorAction;
  }

}

class DataLoaderTaskDescriptor {
  constructor(pattern, params, options) {
    this.pattern = pattern;
    this.params = params;
    this.options = options;
  }

  supports(action) {
    switch (typeof this.pattern) {
      case 'object':
        return isEqual(this.pattern, action);
      case 'function':
        return this.pattern(action) === true;
      default:
        return this.pattern === action.type;
    }
  }

  newTask(context, action) {
    const worker = new DataLoaderTask(context, action, this.params, this.options);
    return worker;
  }
}

/**
 * Create a new DataLoaderDescriptor
 *
 * @param {string|object|function} pattern pattern to match action
 * @param {object} params parameters
 * @param {object} options options
 * @returns {DataLoaderTaskDescriptor} a descriptor object for creating data loader
 */
function createLoader(pattern, params, options) {
  return new DataLoaderTaskDescriptor(pattern, params, options);
}

export default createLoader;
