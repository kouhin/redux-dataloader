import findKey from 'lodash/findKey';
import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import assign from 'lodash/assign';
import flattenDeep from 'lodash/flattenDeep';
import get from 'lodash/get';
import isInteger from 'lodash/isInteger';

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
    middleware.cache = {};
    const ctx = assign({}, withArgs, {
      dispatch,
      getState,
    });

    return next => (receivedAction) => {
      // eslint-disable-next-line no-underscore-dangle
      if (receivedAction._id !== REDUX_DATALOADER_ACTION_ID) {
        return next(receivedAction);
      }
      return receivedAction.then((asyncAction) => {
        // dispatch data loader request action
        next(asyncAction);

        const { action } = asyncAction.meta;
        const taskKey = findTaskKey(middleware.cache, action);
        if (taskKey) {
          return middleware.cache[taskKey].promise;
        }

        const taskDescriptor = find(flattenedLoaders, loader => loader.supports(action));
        if (!taskDescriptor) {
          throw new Error('No loader for action', action);
        }

        // Priority: Action Meta Options > TaskDescriptor Options > Middleware Options
        const options = assign(
          {},
          middlewareOpts,
          taskDescriptor.options,
          get(asyncAction, 'meta.options', {}),
        );

        const task = taskDescriptor.newTask(ctx, action);
        const runningTask = new Promise((resolve, reject) => {
          task.execute(options, (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });

        if (isInteger(options.ttl) && options.ttl > 0) {
          const key = uniqueId(`${action.type}__`);
          middleware.cache[key] = { action, promise: runningTask };
          if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            setTimeout(() => {
              delete middleware.cache[key];
            }, options.ttl);
          }
        }
        return runningTask;
      });
    };
  };
  return middleware;
}
