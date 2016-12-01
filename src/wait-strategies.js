/**
 * @fileOverview WaitStrategy creators inspired by [guava-retrying](https://github.com/rholder/guava-retrying)
 * @name wait-strategies.js
 * @license MIT
 */

/**
 * Returns a wait strategy that sleeps a fixed amount of time before retrying (in millisecond).
 */
export function* fixedWait(sleepTime) {
  for (;;) {
    yield sleepTime;
  }
}

/**
 * Returns a strategy which sleeps for an exponential amount of time after the first failed attempt,
 * and in exponentially incrementing amounts after each failed attempt up to the maximumTime.
 */
export function* exponentialWait(multiplier = 1, max = Number.MAX_VALUE) {
  let current = 2 * multiplier;
  for (;;) {
    const next = 2 * current;
    if (next > max) {
      yield current;
    } else {
      yield current;
      current = next;
    }
  }
}

/**
 * Returns a strategy which sleeps for an increasing amount of time after the first failed attempt
 * and in Fibonacci increments after each failed attempt up to the maximumTime.
 */
export function* fibonacciWait(multiplier = 1, max = Number.MAX_VALUE) {
  let fn1 = 1 * multiplier;
  let fn2 = 1 * multiplier;
  for (;;) {
    const current = fn2;
    if (fn1 > max) {
      yield current;
    } else {
      fn2 = fn1;
      fn1 += current;
      yield current;
    }
  }
}

/**
 * Returns a strategy that sleeps a fixed amount of time after the first failed attempt
 * and in incrementing amounts of time after each additional failed attempt.
 */
export function* incrementingWait(initialSleepTime = 0, increment = 1000, max = Number.MAX_VALUE) {
  let current = initialSleepTime;
  yield current;
  for (;;) {
    if (current + increment > max) {
      return current;
    }
    current += increment;
    yield current;
  }
}

/**
 * Returns a strategy that sleeps a random amount of time before retrying.
 */
export function* randomWait(min, max) {
  for (;;) {
    yield parseInt(min + ((max - min) * Math.random()), 10);
  }
}
