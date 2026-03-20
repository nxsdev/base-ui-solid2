# Solid 2 Migration Notes

Primary source: the official Solid 2 beta migration guide plus the Solid 2 RFC chapter set.

Use this file as the high-level checklist before opening the topic-specific references.

## Imports

- DOM runtime moved:
  - `solid-js/web` -> `@solidjs/web`
- Alternate JSX/runtime helpers moved:
  - `solid-js/h` -> `@solidjs/h`
  - `solid-js/html` -> `@solidjs/html`
  - `solid-js/universal` -> `@solidjs/universal`
- Store helpers now come from `solid-js`.

## High-level checklist

- Effects and batching:
  Read [solid2-reactivity-effects.md](solid2-reactivity-effects.md).
- Signals, ownership, context:
  Read [solid2-signals-ownership.md](solid2-signals-ownership.md).
- Control flow:
  Read [solid2-control-flow.md](solid2-control-flow.md).
- Stores:
  Read [solid2-stores.md](solid2-stores.md).
- Async and actions:
  Read [solid2-async.md](solid2-async.md).
- DOM and directives:
  Read [solid2-dom.md](solid2-dom.md).

## Repo-specific summary

- Convert internals to Solid 2 beta directly. Do not add Solid 1 compatibility layers.
- Preserve Base UI public behavior from `packages/react`.
- Keep JSX/DOM-only sentinels and spelling rules at the DOM boundary.
- Record every test rewrite in `packages/solid2/TEST_REWRITE_NOTES.md`.
