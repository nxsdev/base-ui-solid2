<!-- markdownlint-disable MD038 -->

# packages/solid2 Guidelines

This directory is the Solid 2 beta port of Base UI.

## Scope and references

- `packages/react/` is the source of truth for public behavior, tests, and component coverage.
- `packages/solid2/` is the active porting area.
- `docs-solid2/` is the copied Solid demo/docs site and is the fastest place to compare Solid demos while porting.
- Use `PORTING_PLAN.md` to decide whether a component is copied, missing, or needs a fresh Solid 2 implementation.

## Solid 2 beta rules

- Prefer Solid 2 beta APIs and patterns when touching a file.
- Preserve public Base UI DX and API shape when it is user-facing, including `render` composition and prop-merging semantics that existing consumers depend on.
- Use `@solidjs/web`, `@solidjs/h`, and `@solidjs/universal` instead of `solid-js/web`, `solid-js/h`, and `solid-js/universal`.
- Import store helpers from `solid-js`, not `solid-js/store`.
- Do not use `Context.Provider`; use `<Context value={...}>`.
- Do not add `onMount`; prefer `onSettled`.
- Do not add `use:` directives; use `ref` directive factories.
- Do not use `Index`; use `<For keyed={false}>`.
- Do not introduce compatibility layers, shims, aliases, or wrappers that preserve Solid 1 APIs. Port code directly to Solid 2 beta APIs.
- Keep compatibility at the Base UI public contract layer, not by recreating removed Solid 1 APIs internally.
- Avoid top-level reactive reads and prop destructuring in component bodies.
- Narrow internal helpers are allowed only when they preserve existing Base UI behavior and stay implementation-private. Do not add broad generic replacements for removed Solid 1 helpers.
- Treat `JSX.RemoveAttribute` as a props-boundary concern only. Normalize it to internal `string | undefined` values before storing ids in signals, stores, or context.
- Do not mechanically replace every legacy effect with `createTrackedEffect`. Use it narrowly for listener registration, imperative DOM synchronization, or cleanup-heavy bridges where a single tracked callback is still the clearest migration step.
- Prefer split `createEffect(compute, apply)` for value synchronization and store/context updates, and prefer `onSettled` for mount/settle timing. Reduce temporary `createTrackedEffect` usage as files stabilize.
- Do not write signals or stores from `createMemo`; derive values instead.
- Prefer `satisfies` over `as` assertions when validating Solid 2 prop objects, render objects, and helper return shapes.
- Use `as` only when `satisfies`, narrowing, or a local typed helper cannot express the boundary correctly, and keep the assertion narrow, local, and justified by the surrounding API boundary.

## Porting workflow

1. Compare the target area with `packages/react/` first.
2. Check whether the current `packages/solid2/` copy already has the same part structure.
3. Rewrite the file to Solid 2 beta conventions instead of keeping Solid 1 syntax around.
4. If a demo exists in `docs-solid2`, update it alongside the component when behavior changes.

## Verification

- Run `pnpm typescript` after meaningful changes.
- Run focused tests for `packages/solid2` when possible.
- If you touch docs or demos under `docs-solid2`, verify the site still starts.
- If you rewrite a `packages/solid2` test, test fixture, or shared test setup file, you MUST update `packages/solid2/TEST_REWRITE_NOTES.md` before committing. Include the affected cases, the exact nature of the rewrite, whether it was syntax-only, observation-only, infrastructure-only, or a reverted change, and why public React/Base UI compatibility is still preserved.
