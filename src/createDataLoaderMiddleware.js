import findKey from 'lodash/findKey';
import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import flattenDeep from 'lodash/flattenDeep';
import get from 'lodash/get';

import { REDUX_DATALOADER_ACTION_ID } from './constants';

function findTaskKey(runningTasksMap, action) {
  return findKey(runningTasksMap, o =>
    (o.action.type === action.type && isEqual(o.action, action)));
}

export default function createDataLoaderMiddleware(
  loaders = [],
  withArgs = {},
  middlewareOpts = {},
) {
  const flattenedLoaders = flattenDeep(loaders);
  let currentId = 1;
  const uniqueId = (prefix) => {
    currentId += 1;
    return `${prefix}${currentId}`;
  };

  const middleware = ({ dispatch, getState }) => {
    middleware.runningTasks = {};
    const ctx = Object.assign(
      {},
      withArgs,
      {
        dispatch,
        getState,
      },
    );

    return next => (receivedAction) => {
      // eslint-disable-next-line no-underscore-dangle
      if (receivedAction._id !== REDUX_DATALOADER_ACTION_ID) {
        return next(receivedAction);
      }
      return receivedAction.then((asyncAction) => {
        // dispatch data loader request action
        next(asyncAction);

        const { action } = asyncAction.meta;
        const taskKey = findTaskKey(middleware.runningTasks, action);
        if (taskKey) {
          return middleware.runningTasks[taskKey].promise;
        }

        const taskDescriptor = find(flattenedLoaders, loader => loader.supports(action));
        if (!taskDescriptor) {
          throw new Error('No loader for action', action);
        }

        // Priority: Action Meta Options > TaskDescriptor Options > Middleware Options
        const options = Object.assign(
          {},
          middlewareOpts,
          taskDescriptor.options,
          get(asyncAction, 'meta.options', {}),
        );

        const task = taskDescriptor.newTask(ctx, action);
        const runningTask = task.execute(options);

        if (Number.isInteger(options.ttl) && options.ttl > 0) {
          const key = uniqueId(`${action.type}__`);
          middleware.runningTasks[key] = { action, promise: runningTask };
          if (typeof navigator !== 'undefined') {
            setTimeout(() => {
              delete middleware.runningTasks[key];
            }, options.ttl);
          }
        }
        return runningTask;
      });
    };
  };
  return middleware;
}
