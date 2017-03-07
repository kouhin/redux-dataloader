import isEqual from 'lodash/isEqual';

import Task from './Task';
import { DEFAULT_OPTIONS } from './constants';

export default class TaskDescriptor {
  constructor(pattern, params, options = {}) {
    this.pattern = pattern;
    this.params = params;
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);
    if (this.options.retryTimes < 1) {
      this.options.retryTimes = 1;
    }
  }

  supports(action) {
    switch (typeof this.pattern) {
      case 'object':
        return isEqual(this.pattern, action);
      case 'function':
        return this.pattern(action) === true;
      default:
        return this.pattern === action.type;
    }
  }

  newTask(context, action) {
    return new Task(context, action, this.params);
  }
}
