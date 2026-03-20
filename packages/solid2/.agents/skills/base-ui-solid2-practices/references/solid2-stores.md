# Solid 2 Stores

Primary source: the official Solid 2 RFC on stores.

Use this file when editing `createStore`, store setter calls, `snapshot`, `storePath`, `merge`, or `omit`.

## Core rules

- Store setters are draft-first by default.
- Returning a value from the setter performs a shallow replacement/diff of the top-level shape.
- `storePath(...)` exists as an opt-in migration helper, not the preferred style.
- `merge` replaces generic `mergeProps`-style behavior in Solid 2.
- `omit` replaces `splitProps`-style omission patterns.

## Migration checks

- Prefer draft mutation setters over path-argument setters in new internal Solid 2 code.
- Use `snapshot` instead of `unwrap`.
- Treat `undefined` in `merge` as an explicit value, not "missing".
- Be cautious with helper proliferation. In this repo, internal helpers are acceptable only when they preserve Base UI public semantics and stay private.

## Repo-specific guidance for packages/solid2

- This port may keep narrow private helpers where the copied Base UI architecture depends on stable component prop partitioning.
- Do not introduce broad Solid 1 compatibility shims just to keep old store setter call sites alive.
