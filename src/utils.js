export function isPromise(val) {
  return val && typeof val.then === 'function';
}

export function isAction(action) {
  const result = action && (typeof action) === 'object' &&
        action.type && (typeof action.type) === 'string';
  return result;
}

export function formatError(err) {
  const error = (err instanceof Error) ? err : JSON.stringify(err);
  const result = {
    message: error.message,
    name: error.name,
    stack: err.stack,
  };
  return result;
}
