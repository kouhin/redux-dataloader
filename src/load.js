import { loadRequest } from './action'

export default function load (action) {
  if (typeof action !== 'object') {
    throw new Error('action must be object', action)
  }
  return Promise.resolve(loadRequest(action))
}
