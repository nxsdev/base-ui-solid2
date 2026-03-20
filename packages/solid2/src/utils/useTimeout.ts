import { getOwner, onCleanup } from 'solid-js';

type TimeoutId = number;
export type Timeout = ReturnType<typeof useTimeout>;

const EMPTY = 0 as TimeoutId;

/**
 * A `setTimeout` with automatic cleanup and guard.
 */
export function useTimeout() {
  let currentId: TimeoutId = EMPTY;
  const owner = getOwner();

  function start(delay: number, fn: Function) {
    clear();
    currentId = setTimeout(() => {
      currentId = EMPTY;
      fn();
    }, delay) as unknown as TimeoutId;
  }

  function clear() {
    if (currentId !== EMPTY) {
      clearTimeout(currentId as TimeoutId);
      currentId = EMPTY;
    }
  }

  function isStarted() {
    return currentId !== EMPTY;
  }

  // Some Base UI helpers construct timers from imperative callbacks where there is no
  // current owner in Solid 2. Only register automatic cleanup when an owner exists.
  if (owner) {
    onCleanup(() => {
      clear();
    });
  }

  return { start, clear, isStarted };
}
