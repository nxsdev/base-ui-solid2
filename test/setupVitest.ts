import { vi } from 'vitest';
import setupVitest from '@mui/internal-test-utils/setupVitest';
// eslint-disable-next-line import/no-relative-packages
import '../packages/react/test/addVitestMatchers';
import '@testing-library/jest-dom/vitest';
// Use the workspace source path so non-React package test projects resolve consistently.
import { reset } from '../packages/utils/src/error';

declare global {
  // eslint-disable-next-line vars-on-top
  var BASE_UI_ANIMATIONS_DISABLED: boolean;
}

setupVitest();

const originalConsoleError = console.error.bind(console);
console.error = (...args: Parameters<typeof console.error>) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes("Not implemented: HTMLFormElement's requestSubmit() method")
  ) {
    return;
  }

  originalConsoleError(...args);
};

afterEach(() => {
  vi.resetAllMocks();
  reset();
});

globalThis.BASE_UI_ANIMATIONS_DISABLED = true;

if (typeof window !== 'undefined' && window?.navigator?.userAgent?.includes('jsdom')) {
  globalThis.requestAnimationFrame = (cb) => {
    setTimeout(() => cb(0), 0);
    return 0;
  };

  const virtualConsole = (window as typeof window & {
    _virtualConsole?: { emit: (...args: any[]) => unknown };
  })._virtualConsole;

  if (virtualConsole?.emit) {
    const originalEmit = virtualConsole.emit.bind(virtualConsole);
    virtualConsole.emit = (...args: any[]) => {
      const [type, error] = args;
      if (
        type === 'jsdomError' &&
        error instanceof Error &&
        error.message.includes("Not implemented: HTMLFormElement's requestSubmit() method")
      ) {
        return undefined;
      }

      return originalEmit(...args);
    };
  }
}
