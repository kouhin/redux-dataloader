import findKey from 'lodash/findKey';
import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import isInteger from 'lodash/isInteger';
import Debug from 'debug';

import { isPromise } from './utils';
import { LOAD_DATA_REQUEST_ACTION } from './action';

const debug = new Debug('redux-dataloader:middleware');

function findRunningTaskKey(runningTasksMap, action) {
  return findKey(runningTasksMap, (o) => isEqual(o.action, action));
}

export default function createDataLoaderMiddleware(loaders, args, opts) {
  const runningTasks = {};

  let currentId = 1;
  const uniqueId = (prefix) => `${prefix}${currentId++}`;

  const middleware = ({ dispatch, getState }) => {
    const ctx = {
      ...args,
      dispatch,
      getState,
    };

    return (next) => (receivedAction) => {
      if (!isPromise(receivedAction)) {
        return next(receivedAction);
      }
      debug('Received a promise action', receivedAction);

      return receivedAction.then((asyncAction) => {
        if (asyncAction.type !== LOAD_DATA_REQUEST_ACTION) {
          debug(`Received promise action is not ${LOAD_DATA_REQUEST_ACTION}, pass it to the next middleware`); // eslint-disable-line max-len
          return next(receivedAction);
        }
        debug(`Received promise action is ${LOAD_DATA_REQUEST_ACTION}, pass wrapped action to the next middleware`); // eslint-disable-line max-len
        next(asyncAction); // dispatch data loader request action
        const { action } = asyncAction.meta;
        debug('Original action is', action);
        const runningTaskKey = findRunningTaskKey(runningTasks, action);
        debug('Find task from task cache');
        if (runningTaskKey) {
          debug('Cache hit!, Key = ', runningTaskKey);
          return runningTasks[runningTaskKey].promise;
        }

        const taskDescriptor = find(loaders, (loader) => loader.supports(action));
        debug('Cache does not hit, finding task descriptor', taskDescriptor);

        if (!taskDescriptor) {
          throw new Error('No loader for action', action);
        }

        const options = {
          ...opts,
          ...taskDescriptor.options,
          ...(asyncAction.meta.options || {}),
        };
        debug(
          'Merge options from taskDescriptor and dispatched action',
          taskDescriptor.options,
          asyncAction.meta.options, options
        );

        const key = uniqueId(`${action.type}__`);
        debug('Generate new cache key', key);
        debug('Start executing');
        const runningTask = taskDescriptor.newTask(ctx, action).execute(options);

        if (isInteger(options.ttl) && options.ttl > 0) {
          runningTasks[key] = {
            action,
            promise: runningTask,
          };
          debug(`Set cache ttl for task[${key}], ttl = ${options.ttl}`);
          setTimeout(() => {
            debug(`Task[${key}] is removed from cache, for ttl = ${options.ttl} ms`);
            delete runningTasks[key];
          }, options.ttl);
        }
        return runningTask;
      });
    };
  };

  middleware.runningTasks = runningTasks;

  return middleware;
}
