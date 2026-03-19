# Solid 2 Beta Porting Plan

This repository is building a new Solid 2 beta port inside `packages/solid2/` while keeping `packages/react/` as the authoritative upstream implementation.

## Goals

- Keep public API parity with the current React package wherever practical.
- Reuse the successful file and demo organization patterns from `../base-ui-solid`.
- Avoid carrying over Solid 1 assumptions when Solid 2 beta offers a better primitive or required migration path.

## Reference order

1. `packages/react/` and `docs/src/app/(docs)/react/`
2. `../base-ui-solid/packages/solid/`
3. `../base-ui-solid/docs-solid/`
4. `SOLID2_DIFF_AUDIT.md`

When those disagree, match the current React surface first and use the legacy Solid repo only to guide structure and prior adaptation patterns.

## Coverage snapshot

Components and utilities already present in `../base-ui-solid/packages/solid/src`:

- `accordion`
- `alert-dialog`
- `avatar`
- `checkbox`
- `checkbox-group`
- `collapsible`
- `composite`
- `context-menu`
- `dialog`
- `direction-provider`
- `field`
- `fieldset`
- `floating-ui-solid`
- `form`
- `input`
- `menu`
- `menubar`
- `merge-props`
- `meter`
- `navigation-menu`
- `number-field`
- `popover`
- `preview-card`
- `progress`
- `radio`
- `radio-group`
- `scroll-area`
- `select`
- `separator`
- `slider`
- `switch`
- `tabs`
- `toast`
- `toggle`
- `toggle-group`
- `toolbar`
- `tooltip`
- `unstable-no-ssr`
- `unstable-use-media-query`
- `use-button`
- `use-render`
- `utils`

Current React areas that do not exist in the legacy Solid repo and therefore need fresh Solid 2 work:

- `autocomplete`
- `button`
- `calendar`
- `combobox`
- `csp-provider`
- `drawer`
- `floating-ui-react` replacement strategy
- `labelable-provider`
- `localization-provider`
- `temporal-adapter-date-fns`
- `temporal-adapter-luxon`
- `temporal-adapter-provider`
- `types`

Legacy Solid areas that need explicit review before reuse:

- `floating-ui-solid`
  Reason: naming and integration should be revalidated against current upstream `floating-ui-react` usage.
- `unstable-no-ssr`
  Reason: this utility is not exposed in the current React package surface and may not belong in `solid2`.

## Delivery phases

## Phase 0: Workspace and policy

- Create `packages/solid2/`.
- Update repo guidance to make React the behavioral source of truth and `../base-ui-solid` the structural reference.
- Add initial docs entrypoints under `docs/src/app/(docs)/solid2/`.

## Phase 1: Lowest-risk reusable ports

Start with components whose legacy Solid counterparts already exist and whose React APIs are still close to the old port:

- `separator`
- `input`
- `toggle`
- `toggle-group`
- `radio-group`
- `checkbox-group`
- `merge-props`
- `direction-provider`
- `use-render`

Exit criteria:

- Ported source exists in `packages/solid2/src/`.
- Matching behavioral tests are added or adapted.
- Public docs page and at least the hero demo structure exist under `docs/src/app/(docs)/solid2/`.

## Phase 2: Core popup and composite primitives

- `dialog`
- `popover`
- `tooltip`
- `menu`
- `context-menu`
- `menubar`
- `navigation-menu`
- `select`
- `scroll-area`
- `toolbar`

Special attention:

- DOM registration timing
- focus restoration
- detached triggers
- positioning abstractions

## Phase 3: Stateful form and collection components

- `accordion`
- `collapsible`
- `field`
- `fieldset`
- `form`
- `number-field`
- `slider`
- `switch`
- `tabs`
- `toast`

## Phase 4: React-only additions with no legacy Solid reference

- `autocomplete`
- `button`
- `calendar`
- `combobox`
- `drawer`
- localization and temporal utilities
- providers and shared type surfaces missing from the old Solid repo

These should be designed from the current React implementation and current docs, using the Solid 2 beta architecture directly rather than back-porting from Solid 1.

## Demo policy

- Match the React docs route structure under `docs/src/app/(docs)/solid2/`.
- Keep demo folder naming aligned with React:
  `demos/<demo-name>/css-modules/index.tsx`
  `demos/<demo-name>/tailwind/index.tsx`
- Compare each new demo with the matching React docs demo and the legacy `docs-solid` demo before adapting it to Solid 2.
- If a React component has no legacy Solid demo, copy the React demo structure and rewrite the implementation idiomatically for Solid 2.

## Solid 2 migration guardrails

- No legacy `.Provider` context syntax in component implementations.
- Avoid top-level prop destructuring.
- Use current DOM state at event time for focus and roving logic.
- Re-check uncontrolled state transitions for same-tick updates.
- Do not copy React hook timing assumptions into Solid effects.

## Definition of done for a component

- Source is added under `packages/solid2/src/<feature>/`.
- Public exports match the intended Solid 2 surface.
- Tests verify the key behaviors covered by the React implementation.
- Docs page exists under `docs/src/app/(docs)/solid2/components/<feature>/`.
- Demo structure matches the React docs layout.
- Any intentional API mismatch is documented in the component page and commit message.
