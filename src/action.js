export const LOAD_DATA_REQUEST_ACTION = '@redux-dataloader/REQUEST';
export const LOAD_DATA_SUCCESS_ACTION = '@redux-dataloader/SUCCESS';
export const LOAD_DATA_FAILURE_ACTION = '@redux-dataloader/FAILURE';

export function loadFailure(action, error) {
  return {
    type: LOAD_DATA_FAILURE_ACTION,
    payload: {
      error,
    },
    meta: {
      action,
    },
    error: true,
  };
}

export function loadSuccess(action, data) {
  return {
    type: LOAD_DATA_SUCCESS_ACTION,
    payload: {
      data,
    },
    meta: {
      action,
    },
  };
}

/**
 * Loading action with redux-dataloader
 *
 * @param {Object} action
 * @return {Object} Loading Data Action
 */
export function loadRequest(action) {
  return {
    type: LOAD_DATA_REQUEST_ACTION,
    payload: {
      action,
    },
  };
}
