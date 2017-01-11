/**
 * @fileOverview WaitStrategy creators inspired by [guava-retrying](https://github.com/rholder/guava-retrying)
 * @name waitStrategies.js
 * @license MIT
 */

/**
 * Returns a wait strategy that sleeps a fixed amount of time before retrying (in millisecond).
 */
export function fixedWait(interval = 0) {
  return () => interval;
}

/**
 * Returns a strategy which sleeps for an exponential amount of time after the first failed attempt,
 * and in exponentially incrementing amounts after each failed attempt up to the maximumTime.
 */
export function exponentialWait(multiplier = 1, max = Number.MAX_VALUE) {
  return (count) => {
    const next = multiplier * Math.pow(2, count); // eslint-disable-line no-restricted-properties
    return next > max ? max : next;
  };
}

/**
 * Returns a strategy which sleeps for an increasing amount of time after the first failed attempt
 * and in Fibonacci increments after each failed attempt up to the maximumTime.
 */
export function fibonacciWait(multiplier = 1, max = Number.MAX_VALUE) {
  const cache = {
    1: 1 * multiplier,
    2: 1 * multiplier,
  };

  const fabonacci = (count) => {
    const n = count < 1 ? 1 : count;
    if (typeof cache[n] === 'number') {
      return cache[n] > max ? max : cache[n];
    }
    const result = fabonacci(n - 1) + fabonacci(n - 2);
    cache[n] = result > max ? max : result;
    return cache[n];
  };
  return fabonacci;
}

/**
 * Returns a strategy that sleeps a fixed amount of time after the first failed attempt
 * and in incrementing amounts of time after each additional failed attempt.
 */
export function incrementingWait(initialSleepTime = 0, increment = 1000, max = Number.MAX_VALUE) {
  return (count) => {
    const n = count < 1 ? 0 : count - 1;
    const next = initialSleepTime + (n * increment);
    return next > max ? max : next;
  };
}

/**
 * Returns a strategy that sleeps a random amount of time before retrying.
 */
export function randomWait(min = 0, max = 0) {
  return () => parseInt(min + ((max - min) * Math.random()), 10);
}
