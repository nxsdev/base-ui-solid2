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
- Read [references/solid2-migration.md](references/solid2-migration.md) when touching framework APIs.
- Read [references/base-ui-porting.md](references/base-ui-porting.md) when deciding repo-specific structure or migration order.

## Workflow

1. Identify the React source files and tests that define the target behavior.
2. Inspect the copied Solid implementation in the matching `packages/solid2/src/<feature>/` area.
3. Convert the file to Solid 2 beta conventions instead of layering compatibility wrappers on top of Solid 1 syntax.
4. Keep imports, tests, and demos consistent with `@base-ui/solid2`.
5. Run relevant checks before finishing.

## Core Rules

- Do not keep `solid-js/web` imports in edited files; migrate them to `@solidjs/web`.
- Do not keep `solid-js/store` imports in edited files; migrate store helpers to `solid-js`.
- Do not add `Context.Provider`, `onMount`, `Index`, or `use:` directives.
- Do not destructure reactive props at the component boundary.
- Do not write signals or stores from `createMemo`.
- Prefer whole-file migration to mixed 1.x/2.0 syntax in the same implementation file.

## Demos and Docs

- If the task changes visible component behavior, check whether `docs-solid2` needs the corresponding demo update.
- Keep demo imports on `@base-ui/solid2`.
- Use `docs-solid2` as the quickest comparison surface for the copied Solid docs site.

## Verification

- Run `pnpm typescript` after meaningful changes.
- Run focused tests when the changed area has them.
- If a task touches docs or demos, make sure the relevant package still starts.

## When Not To Use This Skill

- Do not use this skill for generic React work in `packages/react`.
- Do not use this skill for repo-wide release or publishing tasks.
- For creating or editing skills themselves, use the built-in `$skill-creator`.
