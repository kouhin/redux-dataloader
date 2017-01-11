import asyncify from 'async/asyncify';
import retry from 'async/retry';
import assign from 'lodash/assign';

import { loadFailure, loadSuccess } from './actions';
import { isAction } from './utils';
import { DEFAULT_OPTIONS } from './constants';

export default class Task {
  constructor(context, monitoredAction, params = {}) {
    if (!isAction(monitoredAction)) {
      throw new Error('action must be a plain object');
    }

    this.context = assign({}, context, {
      action: monitoredAction,
    });

    this.params = assign({}, {
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
      fetch({ action }) {
        throw new Error('Not implemented', action);
      },
    }, params);
  }

  execute(options = {}, callback) {
    const opts = assign({}, DEFAULT_OPTIONS, options);

    const context = this.context;
    const dispatch = context.dispatch;
    const {
      success,
      error,
      loading,
      shouldFetch,
      fetch,
    } = this.params;

    const disableInternalAction = options.disableInternalAction;

    if (!shouldFetch(context)) {
      callback(null, null); // load nothing
      if (!disableInternalAction) {
        const successAction = loadSuccess(context.action);
        dispatch(successAction);
      }
      return;
    }

    dispatch(loading(context));

    // Retry
    const asyncFetch = asyncify(fetch);
    retry({
      times: opts.retryTimes,
      interval: opts.retryWait,
    }, (retryCb) => {
      asyncFetch(context, retryCb);
    }, (err, result) => {
      if (err) {
        const errorAction = error(context, err);
        if (!disableInternalAction) {
          dispatch(loadFailure(context.action, err));
        }
        callback(null, dispatch(errorAction));
        return;
      }
      const successAction = success(context, result);
      callback(null, dispatch(successAction));
      if (!disableInternalAction) {
        dispatch(loadSuccess(context.action, result));
      }
    });
  }
}
