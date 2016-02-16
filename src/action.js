import isObject from 'lodash/isObject'

export const LOAD_DATA_REQUEST_ACTION = '@redux-dataloader/REQUEST'
export const LOAD_DATA_SUCCESS_ACTION = '@redux-dataloader/SUCCESS'
export const LOAD_DATA_FAILURE_ACTION = '@redux-dataloader/FAILURE'

export function loadFailure (action, error) {
  if (!isObject(action) || !action.type) {
    return loadFailure('action MUST be a plain object with a type field', action)
  }
  return {
    type: LOAD_DATA_FAILURE_ACTION,
    payload: {
      error,
    },
    meta: {
      action,
    },
    error: true
  }
}

export function loadSuccess (action, data) {
  if (!isObject(action) || !action.type) {
    return loadFailure(action, 'action MUST be a plain object with a type field')
  }
  return {
    type: LOAD_DATA_SUCCESS_ACTION,
    payload: {
      data,
    },
    meta: {
      action
    }
  }
}

/**
 * Loading action with redux-dataloader
 *
 * @param {Object} action
 * @return Loading Data Action
 */
export function load (action) {
  if (!isObject(action) || !action.type) {
    return loadFailure(action, 'action MUST be a plain object with a type field')
  }
  return {
    type: LOAD_DATA_REQUEST_ACTION,
    payload: {
      action
    }
  }
}
