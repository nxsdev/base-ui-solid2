# Solid 2 Reactivity And Effects

Primary source: the official Solid 2 RFC on reactivity, batching, and effects.

Use this file when editing effects, setter timing, cleanup, or any code that used `batch`, `on`, `onMount`, or Solid 1 single-callback `createEffect`.

## Non-negotiable rules

- `batch()` is gone. Solid 2 batches by microtask by default.
- Reads after a setter still see the last committed value until the batch flushes.
- Use `flush()` only when synchronous application is truly required, usually imperative DOM work or tests.
- `createEffect` is split into compute and effect phases.
- `createTrackedEffect` is a special-case primitive, not the default replacement.
- `onSettled` replaces `onMount`.
- `createTrackedEffect` and `onSettled` return cleanup functions. Do not call `onCleanup` inside them.
- Do not write signals or stores from owned reactive scope unless the write is intentionally internal and the primitive was created with `pureWrite: true`.

## How to choose the primitive

- `createMemo`
  Use for readonly derived values.
- `createEffect(compute, effect)`
  Use when you need tracked reads plus a side-effect phase and want Solid 2 semantics.
- `createTrackedEffect`
  Use only when the old behavior genuinely needs a single tracked callback bridge and the code is still correct if it re-runs in async situations.
- `onSettled`
  Use for mount-like or "after the graph settles" work.
- `untrack`
  Use for intentional one-time top-level reads or when breaking dependency capture is the design.

## Migration checks

- If you replaced Solid 1 `createEffect(() => { ... })` with `createTrackedEffect`, ask whether this should really be `createMemo`, split `createEffect`, or `onSettled`.
- If a callback only synchronizes derived state, prefer derivation over write-back.
- If a callback exists only to run after mount, prefer `onSettled`.
- If a callback writes to app state from tracked scope, treat that as a design smell and move the write.
- If cleanup was previously done with `onCleanup` inside an effect body, convert it to `return () => ...` when using `createTrackedEffect` or `onSettled`.

## Repo-specific guidance for packages/solid2

- Do not "fix" warnings by sprinkling `pureWrite: true` on public state.
- Do not hide setter timing problems by rewriting tests to flush more often unless React behavior requires the same observable timing.
- If a component needs immediate DOM after a setter, justify `flush()` at that exact boundary.
