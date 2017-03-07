import retryit from 'retryit';

import { loadFailure, loadSuccess } from './actions';
import { isAction } from './utils';
import { DEFAULT_OPTIONS } from './constants';

export default class Task {
  constructor(context, monitoredAction, params = {}) {
    if (!isAction(monitoredAction)) {
      throw new Error('action must be a plain object');
    }

    this.context = Object.assign({}, context, {
      action: monitoredAction,
    });

    this.params = Object.assign({}, {
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

  execute(options = {}) {
    const opts = Object.assign({}, DEFAULT_OPTIONS, options);

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
      if (!disableInternalAction) {
        const successAction = loadSuccess(context.action);
        dispatch(successAction);
      }
      return Promise.resolve();
    }

    dispatch(loading(context));

    // Retry
    return retryit({
      times: opts.retryTimes,
      interval: opts.retryWait,
    }, () => Promise.resolve(fetch(context)))
      .then((result) => {
        const successAction = success(context, result);
        if (!disableInternalAction) {
          dispatch(loadSuccess(context.action, result));
        }
        return dispatch(successAction);
      })
      .catch((err) => {
        const errorAction = error(context, err);
        if (!disableInternalAction) {
          dispatch(loadFailure(context.action, err));
        }
        return dispatch(errorAction);
      });
  }
}
