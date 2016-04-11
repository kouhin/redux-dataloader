export function isPromise(val) {
  return val && typeof val.then === 'function';
}

export function isAction(action) {
  const result = action && (typeof action) === 'object' &&
        action.type && (typeof action.type) === 'string';
  return result;
}
