---
name: base-ui-solid2-practices
description: |
  Port and maintain Base UI Solid 2 beta code inside packages/solid2.
  Use when: migrating copied Solid 1 code to Solid 2 beta APIs, comparing behavior with packages/react, updating package-local tests, or fixing docs-solid2 demos that import @base-ui/solid2.
---

# Base Ui Solid2 Practices

## Overview

This skill guides Codex when working inside `packages/solid2`.
It keeps the port aligned with current React behavior while rewriting implementation details to Solid 2 beta conventions.

## Before You Edit

- Read [../../AGENTS.md](../../AGENTS.md).
- Use `packages/react/` as the public behavior source of truth.
- Read [references/solid2-migration.md](references/solid2-migration.md) for the high-level Solid 2 beta checklist.
- Read [references/solid2-reactivity-effects.md](references/solid2-reactivity-effects.md) when touching `createEffect`, `createTrackedEffect`, `onSettled`, setters, batching, or cleanup behavior.
- Read [references/solid2-signals-ownership.md](references/solid2-signals-ownership.md) when touching context, ownership, top-level reads, `createRoot`, or derived state setup.
- Read [references/solid2-control-flow.md](references/solid2-control-flow.md) when touching `For`, `Show`, `Switch`, keyed/non-keyed rendering, or callback children.
- Read [references/solid2-stores.md](references/solid2-stores.md) when touching `createStore`, draft setters, `snapshot`, `omit`, or any store rewrite.
- Read [references/solid2-async.md](references/solid2-async.md) when touching async reads, refresh/revalidation, loading boundaries, or action-like mutation flows.
- Read [references/solid2-dom.md](references/solid2-dom.md) when touching JSX props, built-in DOM attributes, boolean attributes, `class`, or directives.
- Read [references/base-ui-porting.md](references/base-ui-porting.md) when deciding repo-specific structure or migration order.

## Workflow

1. Identify the React source files and tests that define the target behavior.
2. Inspect the copied Solid implementation in the matching `packages/solid2/src/<feature>/` area.
3. Convert the file to Solid 2 beta conventions instead of layering compatibility wrappers on top of Solid 1 syntax.
4. Keep imports, tests, and demos consistent with `@base-ui/solid2`.
5. Run relevant checks before finishing.
6. If you rewrite any test, fixture, or test setup, record it in `packages/solid2/TEST_REWRITE_NOTES.md` before committing.

## Core Rules

- Do not keep `solid-js/web` imports in edited files; migrate them to `@solidjs/web`.
- Do not keep `solid-js/store` imports in edited files; migrate store helpers to `solid-js`.
- Do not add `Context.Provider`, `onMount`, `Index`, or `use:` directives.
- Do not destructure reactive props at the component boundary.
- Do not write signals or stores from `createMemo`.
- Do not treat `createTrackedEffect` as the default Solid 1 -> 2 replacement. Use it only for narrow bridge cases where a single tracked callback is still the correct behavior.
- Return cleanup functions from `createTrackedEffect` and `onSettled`; do not call `onCleanup` inside them.
- Keep `JSX.RemoveAttribute` at the JSX/DOM boundary. Normalize to domain values before storing anything in context, stores, signals, or internal registries.
- Preserve Base UI public semantics even when Solid 2 wants different DOM spellings. Example: internal DOM attributes may be lowercase, but public component APIs stay React-compatible unless React behavior changed upstream.
- Prefer whole-file migration to mixed 1.x/2.0 syntax in the same implementation file.

## Demos and Docs

- If the task changes visible component behavior, check whether `docs-solid2` needs the corresponding demo update.
- Keep demo imports on `@base-ui/solid2`.
- Use `docs-solid2` as the quickest comparison surface for the copied Solid docs site.

## Verification

- Run `pnpm typescript` after meaningful changes.
- Run focused tests when the changed area has them.
- When tests are rewritten, update `packages/solid2/TEST_REWRITE_NOTES.md` with the reason, classification, and compatibility impact.
- If a task touches docs or demos, make sure the relevant package still starts.

## When Not To Use This Skill

- Do not use this skill for generic React work in `packages/react`.
- Do not use this skill for repo-wide release or publishing tasks.
- For creating or editing skills themselves, use the built-in `$skill-creator`.
