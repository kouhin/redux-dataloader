import { loadRequest } from './actions';
import { isAction } from './utils';
import { REDUX_DATALOADER_ACTION_ID } from './constants';

export default function load(action) {
  if (!isAction(action)) {
    throw new Error('action must be object', action);
  }
  const asyncAction = new Promise((resolve) => {
    resolve(loadRequest(action));
  });
  // eslint-disable-next-line no-underscore-dangle
  asyncAction._id = REDUX_DATALOADER_ACTION_ID;
  return asyncAction;
}
