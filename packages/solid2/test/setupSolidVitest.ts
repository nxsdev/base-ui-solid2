import { configure } from '@solidjs/testing-library';
import { flush } from 'solid-js';

configure({
  eventWrapper(callback) {
    const result = callback();
    flush();
    return result;
  },
  asyncWrapper: async (callback) => {
    const result = await callback();
    flush();
    return result;
  },
});
