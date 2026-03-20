import { resolve } from 'node:path';
import solidPlugin from 'vite-plugin-solid';
import { defineProject, mergeConfig } from 'vitest/config';
// eslint-disable-next-line import/no-relative-packages
import sharedConfig from '../../vitest.shared.mts';

const PACKAGE_ROOT = resolve(import.meta.dirname);

export default mergeConfig(
  sharedConfig,
  defineProject({
    define: {
      'process.env.NODE_ENV': JSON.stringify('test'),
    },
    plugins: [solidPlugin({ hot: false }) as any],
    resolve: {
      alias: [
        { find: /^solid-js\/web$/, replacement: '@solidjs/web' },
        { find: /^solid-js\/universal$/, replacement: '@solidjs/universal' },
        ...Object.entries(sharedConfig.resolve?.alias ?? {}).map(([find, replacement]) => ({
          find,
          replacement,
        })),
      ],
    },
    test: {
      ...sharedConfig.test,
      setupFiles: [
        ...((sharedConfig.test?.setupFiles as string[] | undefined) ?? []),
        resolve(PACKAGE_ROOT, './test/setupSolidVitest.ts'),
      ],
      server: {
        deps: {
          inline: [
            '@solidjs/testing-library',
            '@solidjs/signals',
            '@solidjs/web',
            '@solidjs/universal',
            '@solid-primitives/props',
            '@solid-primitives/utils',
            'solid-js',
          ],
        },
      },
    },
  }),
);
