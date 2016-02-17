import { loadRequest } from './action'
import { isAction } from './utils'

export default function load (action) {
  if (!isAction(action)) {
    throw new Error('action must be object', action)
  }
  return Promise.resolve(loadRequest(action))
}
