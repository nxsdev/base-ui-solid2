# Solid 2 Signals, Ownership, And Context

Primary source: the official Solid 2 RFC on signals, derived primitives, ownership, and context.

Use this file when touching `createSignal`, `createStore`, `createRoot`, `runWithOwner`, `createContext`, or any component body with top-level reads.

## Core rules

- Ownership is the default. A nested `createRoot` is owned by its parent unless explicitly detached.
- Use `runWithOwner(null, ...)` only for truly detached lifetimes.
- `Context.Provider` is removed. Use the context object itself as the provider component.
- Avoid top-level reactive reads in component bodies unless wrapped in `untrack` or moved into a reactive scope.
- Do not destructure reactive props at the function boundary.

## Derived state choices

- `createMemo`
  Preferred for readonly derivation.
- Function-form `createSignal`
  Use for derived-but-writable signal shapes when the semantics truly require it.
- Function-form `createStore`
  Use for derived/projection stores when a store shape is the right abstraction.
- Split `createEffect`
  Use for reacting to dependencies with side effects.

## Repo-specific guidance for packages/solid2

- Keep public Base UI API shape stable even if the internal owner graph changes.
- Normalize JSX-only types, such as `JSX.RemoveAttribute`, before storing values in context or signals.
- Do not create detached roots in library code unless the lifetime must intentionally escape the component tree.
