export function isAction(action) {
  const result = action && (typeof action) === 'object' &&
        action.type && (typeof action.type) === 'string';
  return result;
}

export function formatError(err) {
  let error;
  if (err instanceof Error) {
    error = err;
  } else if (typeof err === 'object') {
    error = new Error(JSON.stringify(err));
  } else {
    error = new Error(err);
  }
  const result = {};
  Object.getOwnPropertyNames(error).forEach((key) => {
    result[key] = error[key];
  });
  return result;
}
