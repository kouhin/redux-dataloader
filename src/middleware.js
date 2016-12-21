import findKey from 'lodash/findKey';
import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import isInteger from 'lodash/isInteger';

import { DATALOADER_ACTION_ID } from './load';

function findRunningTaskKey(runningTasksMap, action) {
  return findKey(runningTasksMap, o => isEqual(o.action, action));
}

export default function createDataLoaderMiddleware(loaders, args, opts) {
  const runningTasks = {};

  let currentId = 1;
  currentId += 1;
  const uniqueId = prefix => `${prefix}${currentId}`;

  const middleware = ({ dispatch, getState }) => {
    const ctx = {
      ...args,
      dispatch,
      getState,
    };

    return next => (receivedAction) => {
      // eslint-disable-next-line no-underscore-dangle
      if (!receivedAction._id || receivedAction._id !== DATALOADER_ACTION_ID) {
        return next(receivedAction);
      }

      return receivedAction.then((asyncAction) => {
        next(asyncAction); // dispatch data loader request action
        const { action } = asyncAction.meta;
        const runningTaskKey = findRunningTaskKey(runningTasks, action);
        if (runningTaskKey) {
          return runningTasks[runningTaskKey].promise;
        }

        const taskDescriptor = find(loaders, loader => loader.supports(action));

        if (!taskDescriptor) {
          throw new Error('No loader for action', action);
        }

        const options = {
          ...opts,
          ...taskDescriptor.options,
          ...(asyncAction.meta.options || {}),
        };

        const key = uniqueId(`${action.type}__`);
        const runningTask = taskDescriptor.newTask(ctx, action).execute(options);

        if (isInteger(options.ttl) && options.ttl > 0) {
          runningTasks[key] = {
            action,
            promise: runningTask,
          };
          if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            setTimeout(() => {
              delete runningTasks[key];
            }, options.ttl);
          }
        }
        return runningTask;
      });
    };
  };

  middleware.runningTasks = runningTasks;

  return middleware;
}
