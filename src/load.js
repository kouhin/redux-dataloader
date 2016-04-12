import Debug from 'debug';
import { loadRequest } from './action';
import { isAction } from './utils';

const debug = new Debug('redux-dataloader:load');

export default function load(action) {
  if (!isAction(action)) {
    throw new Error('action must be object', action);
  }
  if (debug.enabled) {
    debug('load() an action = ', action);
    debug('A Promise with a wrapped action is returned', loadRequest(action));
  }
  return Promise.resolve(loadRequest(action));
}
