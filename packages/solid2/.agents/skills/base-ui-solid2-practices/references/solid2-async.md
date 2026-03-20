# Solid 2 Async Data And Actions

Primary sources: the official Solid 2 RFCs on async data and actions/optimistic updates.

Use this file when touching async reads, loading UI, refresh behavior, or mutation flows that may be ported in the future.

## Async reads

- Solid 2 treats async as part of computations rather than a separate `createResource` model.
- `Loading` is the boundary for initial readiness.
- `isPending(fn)` is for stale-while-revalidating indicators after a value has already rendered.
- `latest(fn)` can be used when you need the last resolved value without falling back.

## Actions and optimistic flows

- `action()` wraps async mutations and coordinates optimistic writes, awaited work, and refresh.
- `refresh()` is the explicit recomputation hook after writes.
- `createOptimistic` and `createOptimisticStore` model optimistic state that resets to the source when the transition completes.

## Repo-specific guidance for packages/solid2

- This Base UI port still follows current React package behavior first. Do not invent new public async APIs just because Solid 2 enables them.
- Use these APIs only when the upstream React behavior requires equivalent async semantics or when internal demo/test infrastructure needs true Solid 2 primitives.
