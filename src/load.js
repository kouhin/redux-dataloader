import { loadRequest } from './action';
import { isAction } from './utils';

export const DATALOADER_ACTION_ID = () => {};

export default function load(action) {
  if (!isAction(action)) {
    throw new Error('action must be object', action);
  }
  const asyncAction = Promise.resolve(loadRequest(action));
  // eslint-disable-next-line no-underscore-dangle
  asyncAction._id = DATALOADER_ACTION_ID;
  return asyncAction;
}
