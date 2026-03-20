# Solid 2 Control Flow

Primary source: the official Solid 2 RFC on control flow.

Use this file when editing `For`, `Show`, `Switch`, loading/error boundaries, or function children in JSX.

## Core rules

- `Index` is gone.
- `For` covers both keyed and non-keyed cases.
- `keyed={false}` is the direct replacement for old `Index`.
- `For` children receive accessors for both item and index.
- Control-flow function children are structure-building callbacks. Reactive reads in the callback body itself do not become magically tracked.

## Migration checks

- If an old `Index` callback used `item()`, keep accessor semantics in the new `For keyed={false}` version.
- If a `For` callback body does reactive reads before JSX return, move those reads into JSX, a memo, or another explicit reactive scope.
- `Suspense`/`ErrorBoundary` guidance in the RFC maps to `Loading`/`Errored`, but this repo should preserve current public behavior until the library intentionally adopts those APIs.

## Repo-specific guidance for packages/solid2

- Do not rewrite public library APIs just because the Solid 2 RFC renames a control-flow primitive.
- For Base UI component internals, the important migration is callback accessor semantics and removal of `Index`.
