import findKey from 'lodash/findKey';
import find from 'lodash/find';
import isEqual from 'lodash/isEqual';

import { isPromise } from './utils';
import { LOAD_DATA_REQUEST_ACTION } from './action';

function findRunningTaskKey(runningTasksMap, action) {
  return findKey(runningTasksMap, (o) => isEqual(o.action, action));
}

export default function createDataLoaderMiddleware(loaders, args) {
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

      return receivedAction.then((asyncAction) => {
        if (asyncAction.type !== LOAD_DATA_REQUEST_ACTION) {
          return next(receivedAction);
        }
        next(asyncAction); // dispatch data loader request action
        const { action } = asyncAction.payload;
        const runningTaskKey = findRunningTaskKey(runningTasks, action);
        if (runningTaskKey) {
          return runningTasks[runningTaskKey].promise;
        }

        const taskDescriptor = find(loaders, (loader) => loader.supports(action));

        if (!taskDescriptor) {
          throw new Error('No loader for action', action);
        }

        const key = uniqueId(`${action.type}__`);
        const runningTask = taskDescriptor.newTask(ctx, action).execute();
        runningTasks[key] = {
          action,
          promise: runningTask,
        };

        if (runningTask.options.ttl) {
          setTimeout(() => {
            delete runningTasks[key];
          }, runningTask.options.ttl);
        }

        return runningTask;
      });
    };
  };

  middleware.runningTasks = runningTasks;

  return middleware;
}
