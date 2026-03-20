import { createRequire } from 'node:module';
import { realpathSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import solidPlugin from 'vite-plugin-solid';
import { defineProject, mergeConfig } from 'vitest/config';
// eslint-disable-next-line import/no-relative-packages
import sharedConfig from '../../vitest.shared.mts';

const PACKAGE_ROOT = resolve(import.meta.dirname);
const packageRequire = createRequire(resolve(PACKAGE_ROOT, 'package.json'));
const resolvePackageRoot = (specifier: string) => {
  const entry = packageRequire.resolve(specifier);
  return realpathSync(dirname(dirname(entry)));
};

const SOLID_JS_ROOT = resolvePackageRoot('solid-js');
const SOLID_WEB_ROOT = resolvePackageRoot('@solidjs/web');
const SOLID_UNIVERSAL_ROOT = resolvePackageRoot('@solidjs/universal');
const SOLID_JS_DEV = resolve(SOLID_JS_ROOT, 'dist/dev.js');
const SOLID_WEB_DEV = resolve(SOLID_WEB_ROOT, 'dist/dev.js');
const SOLID_TESTING_LIBRARY_ESM = resolve(
  PACKAGE_ROOT,
  '../../node_modules/.pnpm/@solidjs+testing-library@0.8.10_@solidjs+router@0.15.4_solid-js@2.0.0-beta.3__solid-js@2.0.0-beta.3/node_modules/@solidjs/testing-library/dist/index.js',
);

const solidHAlias = (() => {
  try {
    const solidHRoot = resolvePackageRoot('@solidjs/h');
    return { find: /^(@solidjs\/h|solid-js\/h)$/, replacement: resolve(solidHRoot, 'dist/h.js') };
  } catch {
    return null;
  }
})();

export default mergeConfig(
  sharedConfig,
  defineProject({
    define: {
      'process.env.NODE_ENV': JSON.stringify('test'),
    },
    plugins: [solidPlugin() as any],
    resolve: {
      alias: [
        { find: /^solid-js\/web$/, replacement: SOLID_WEB_DEV },
        { find: /^solid-js\/universal$/, replacement: SOLID_UNIVERSAL_ROOT },
        { find: /^@solidjs\/web$/, replacement: SOLID_WEB_DEV },
        { find: /^@solidjs\/universal$/, replacement: SOLID_UNIVERSAL_ROOT },
        { find: /^solid-js$/, replacement: SOLID_JS_DEV },
        { find: /^@solidjs\/testing-library$/, replacement: SOLID_TESTING_LIBRARY_ESM },
        ...(solidHAlias ? [solidHAlias] : []),
        ...Object.entries(sharedConfig.resolve?.alias ?? {}).map(([find, replacement]) => ({
          find,
          replacement,
        })),
      ],
      dedupe: ['solid-js', '@solidjs/web', '@solidjs/universal', '@solidjs/h'],
    },
    test: {
      ...sharedConfig.test,
      // browser: {
      //   enabled: true,
      //   provider: 'playwright',
      //   screenshotFailures: false,
      //   headless: true,
      //   instances: [{ browser: 'chromium', name: 'chromium-solid' }],
      // },
      server: {
        deps: {
          inline: ['@solidjs/testing-library', '@solid-primitives/props', '@solid-primitives/utils', 'solid-js'],
        },
      },
    },
  }),
);
