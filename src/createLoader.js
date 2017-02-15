import TaskDescriptor from './TaskDescriptor';

/**
 * Create a new TaskDescriptor
 *
 * @param {string|object|function} pattern pattern to match action
 * @param {object} params parameters
 * @param {object} options options
 * @returns {TaskDescriptor} a descriptor object for creating data loader
 */
export default function createLoader(pattern, params, options) {
  return new TaskDescriptor(pattern, params, options);
}
