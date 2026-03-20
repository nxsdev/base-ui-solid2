<!-- markdownlint-disable MD038 -->

# Repository Guidelines

This repository now contains the upstream React implementation of Base UI and an in-progress Solid 2 beta port.

## Sources of truth

- `packages/react/` is the source of truth for public API shape, behavior, accessibility semantics, tests, and documentation coverage.
- `../base-ui-solid/packages/solid/` is the legacy Solid reference for folder layout, demo naming, and prior Solid-specific adaptations.
- If the React repo and `../base-ui-solid` differ, follow the current React repo first, then adapt the implementation to Solid-native patterns instead of copying React internals mechanically.
- Do not use `../solid-base-ui` as a reference for implementation or policy.

## Project structure

- React source code remains in `packages/react/`.
- Shared public utilities remain in `packages/utils/`.
- Solid 2 beta work lives in `packages/solid2/`.
- Public Solid 2 beta docs live in `docs/src/app/(docs)/solid2/`.
- Public React docs remain in `docs/src/app/(docs)/react/`.
- Experiments that need manual browser testing belong in `docs/src/app/(private)/experiments/`.

## Porting strategy

- Read `PORTING_PLAN.md` before starting a new Solid 2 component or utility port.
- Preserve React API parity unless there is a Solid-specific reason to diverge.
- Preserve existing Base UI and legacy Solid port DX conventions when they are user-facing, including `render`-based composition and prop-merging behavior that consumers rely on.
- Do not remove or redesign public abstractions such as `render` just to make code look more Solid-native; if the public contract exists in React or the legacy Solid port, keep the contract and reimplement the internals correctly for Solid 2.
- Recreate behavior with Solid 2 beta primitives; do not emulate React lifecycle timing unless the public API requires the same visible result.
- Prefer copying directory shape, file naming, and demo naming from `../base-ui-solid` when those still map cleanly to the current React surface.
- When `../base-ui-solid` is missing newer React components, keep the same docs and demo folder conventions as React and note the missing legacy reference in your work.

## Solid 2 beta implementation guidelines

- Prefer fine-grained Solid primitives and direct data flow over React-style state orchestration.
- Do not add compatibility layers, shims, aliases, or wrappers to preserve Solid 1 APIs in `packages/solid2/`; migrate directly to Solid 2 beta APIs.
- Keep compatibility at the public Base UI API layer, not at the Solid 1 API layer. Public behavior may stay compatible; internal implementation must move to native Solid 2 beta patterns.
- Do not use legacy context provider syntax such as `<Context.Provider>...</Context.Provider>` in Solid 2 code.
- Keep context values reactive and clean up registrations with `onCleanup`.
- Avoid top-level prop destructuring in Solid components; prefer accessors, explicit getters, and narrowly scoped internal helpers instead of recreating Solid 1 helper APIs wholesale.
- Narrow internal helpers are acceptable only when they preserve existing Base UI behavior without introducing a generic Solid 1 compatibility surface. Do not spread generic replacements for removed Solid 1 APIs across the package.
- Treat `JSX.RemoveAttribute` as a props-boundary concern only. Normalize it to internal `string | undefined` values before storing ids in signals, stores, or context.
- Do not mechanically replace every legacy effect with `createTrackedEffect`. Use it narrowly for listener registration, imperative DOM synchronization, or cleanup-heavy bridges where a single tracked callback is still the clearest migration step.
- Prefer split `createEffect(compute, apply)` for value synchronization and store/context updates, and prefer `onSettled` for mount/settle timing. Reduce temporary `createTrackedEffect` usage as files stabilize.
- Render structural children explicitly. Do not assume React-style slotting behavior.
- Re-derive timing-sensitive logic such as focus management, list registration, and uncontrolled state updates for Solid instead of porting React timing assumptions.

## Demo and docs guidelines

- For public Solid 2 component pages, mirror the React docs route shape under `docs/src/app/(docs)/solid2/`.
- For demo folders, follow the existing React pattern: `demos/<demo-name>/css-modules/` and `demos/<demo-name>/tailwind/` when both variants are appropriate.
- Compare against both the current React demo and the matching `../base-ui-solid` demo before adapting it to Solid 2.
- Do not introduce custom demo styling beyond the layout patterns already used by the React docs unless a Solid-specific limitation requires it.

## Linting, typechecking, and formatting

- Do not add casts such as `as any` unless a verified type issue requires them.
- Run `pnpm typescript` to verify project references.
- Run `pnpm eslint`.
- Run `pnpm stylelint` when styles change.
- Run `pnpm markdownlint` when docs or policy files change.
- Run `pnpm prettier` when formatting is needed.
- If a public API or docs surface changes, update the relevant docs page under `docs/src/app/(docs)/solid2/` or `docs/src/app/(docs)/react/`.

## Testing

- If a command fails because dependencies are missing, run `pnpm i` and retry.
- When porting a component to Solid 2, bring over or re-create the relevant behavioral tests instead of relying on manual checks alone.
- Prefer the current React tests as the behavioral source of truth.
- Follow existing test naming conventions: `PascalCase.test.tsx` for components and `camelCase.test.ts` for utilities.
- Use Vitest APIs only: `expect()`, `vi.fn()`, and `@testing-library/jest-dom` matchers.
- If a test needs layout measurement or browser-only behavior, keep it in a browser-capable environment rather than forcing it into JSDOM.
- If you rewrite a `packages/solid2` test, test fixture, or shared test setup file, you MUST document the rewrite in `packages/solid2/TEST_REWRITE_NOTES.md` before committing. Record what changed, which cases/helpers were touched, whether it was syntax-only, observation-only, infrastructure-only, or a reverted change, and why the React/Base UI public contract is still unchanged.

## Commit guidelines

- Commit messages follow `[scope] Imperative summary`.
- Use scopes that match the package or component being changed, such as `[solid2]`, `[accordion]`, or `[docs]`.

## Errors

These guidelines apply to public package errors, including future `packages/solid2` exports.

Every error message must:

1. **Say what happened** - Describe the problem clearly
2. **Say why it's a problem** - Explain the consequence
3. **Point toward how to solve it** - Give actionable guidance

Format:

- Prefix with `Base UI: `
- Use string concatenation for readability
- Include a documentation link when applicable (`https://base-ui.com/...`)

### Error Minifier

Run `pnpm extract-error-codes` every time you add or update an error message in a public `Error` constructor.

If a new code is created but the original and new messages still have the same arguments and semantics, reuse the original entry in `docs/src/error-codes.json` instead of keeping a duplicate.
