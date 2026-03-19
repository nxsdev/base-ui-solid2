# Solid 2 Migration Notes

Primary source: the official Solid 2 beta migration guide.

Use this file when editing `packages/solid2` implementation files.

## Imports

- DOM runtime moved:
  - `solid-js/web` -> `@solidjs/web`
- Alternate JSX/runtime helpers moved:
  - `solid-js/h` -> `@solidjs/h`
  - `solid-js/html` -> `@solidjs/html`
  - `solid-js/universal` -> `@solidjs/universal`
- Store helpers now come from `solid-js`:
  - `createStore`, `reconcile`, `snapshot`, `storePath`

## Reactivity and effects

- Signal writes are batched by default. Reads do not immediately see the new value until the batch flushes.
- Use `flush()` only in narrow imperative or test cases.
- `createEffect` uses compute -> apply form in Solid 2.
- Cleanup should usually be returned from the apply function.
- `onMount` is replaced by `onSettled`.

## Component rules

- Avoid top-level reactive reads in component bodies.
- Do not destructure reactive props at the function boundary.
- Prefer reading props in JSX or inside explicit reactive scopes.
- Do not write signals or stores from `createMemo`; derive values instead.

## Control flow

- `Index` is gone.
- Use `<For keyed={false}>` for index-keyed iteration.
- Function children often receive accessors, so call `item()` and `i()`.

## Async and loading

- `Suspense` -> `Loading`
- `ErrorBoundary` -> `Errored`
- `createResource` patterns are replaced with async computations plus `Loading`
- Refresh/revalidation is handled with `refresh(...)`
- Use `isPending(...)` for refreshing indicators

## Stores and helpers

- Prefer draft-style store setters.
- `unwrap(store)` -> `snapshot(store)`
- `mergeProps` -> `merge`
- `splitProps` -> `omit`

## DOM and directives

- `use:` directives are removed.
- Use `ref={directive(...)}` or `ref={[directiveA, directiveB]}`.
- `classList` -> `class` array/object forms.
- `attr:` and `bool:` namespaces are removed.
- `oncapture:` is removed.

## Context

- `Context.Provider` -> use the context object itself as the provider:
  - old: `<Theme.Provider value="dark">`
  - new: `<Theme value="dark">`
