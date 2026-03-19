# Base UI Solid2 Porting Rules

Use this file when the task is specific to Base UI, not generic Solid 2 migration.

## Sources of truth

1. `packages/react/`
2. `PORTING_PLAN.md`
3. Existing `packages/solid2/` structure
4. `docs-solid2/` demos for quick local comparison

## What to preserve

- Public component names and folder shape should stay aligned with React where possible.
- Tests should continue to express React parity, even if the Solid implementation changes internally.
- Demos should stay close to the copied Solid docs structure unless there is a strong reason to simplify.

## What to change aggressively

- Solid 1-only APIs and imports
- Old provider syntax
- `Index`
- `use:` directives
- top-level prop destructuring
- effect patterns that rely on Solid 1 timing

## Porting order

- Start with lower-risk utilities and simple parts when possible.
- Migrate a whole feature area consistently instead of mixing Solid 1 and Solid 2 conventions in the same file.
- If a React component does not exist in the copied Solid code, design from React first instead of inventing a new public shape.

## Validation checklist

- Types still pass
- Package exports still resolve
- Updated tests compile
- Demo imports still point at `@base-ui/solid2`
