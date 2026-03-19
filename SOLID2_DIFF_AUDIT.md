# Solid 2 Diff Audit

This document tracks the upstream React changes that happened after the legacy Solid fork baseline and should guide the `packages/solid2` migration.

## Baseline

- Legacy Solid fork baseline commit used for comparison:
  `b5ed091e5ab52b9730d6cfe87646077a9e4099e3`
- Current repository head when this audit was written:
  `2ff0d70f2`

## Current workspace status

- `packages/solid2/` is a structural copy of the legacy Solid package and has already been renamed to `@base-ui/solid2`.
- `docs-solid2/` is a structural copy of the legacy Solid demo/docs site.
- `pnpm typescript` passes at the workspace level after the initial copy fixes.

## Coverage delta

React top-level source areas that do not exist in `packages/solid2/src` yet:

- `autocomplete`
- `button`
- `calendar`
- `combobox`
- `csp-provider`
- `drawer`
- `floating-ui-react`
- `labelable-provider`
- `localization-provider`
- `temporal-adapter-date-fns`
- `temporal-adapter-luxon`
- `temporal-adapter-provider`
- `types`

Legacy Solid top-level areas that are not present in current React source and must be reviewed before keeping:

- `floating-ui-solid`
- `unstable-no-ssr`

## Docs and demo delta

React docs component routes that exist today but are missing from `docs-solid2`:

- `autocomplete`
- `button`
- `calendar`
- `combobox`
- `drawer`

This means the copied Solid docs are useful as a structural baseline, but not as a complete parity target.

## High-impact upstream changes since the legacy fork baseline

### New public components and providers

- `Combobox` and `Autocomplete` were added after the fork and now have broad API and demo coverage.
- `Button` was added as a public component.
- `Drawer` was added and is no longer a preview-only area.
- `Calendar` was added under the temporal work.
- `CSPProvider` was added.
- Temporal provider/adapters and shared `types` exports were added.

Relevant commits:

- `b7393ac12` `[combobox] New Combobox and Autocomplete components`
- `ad0190c7e` `[button] New Button component`
- `5bbe076fd` `[drawer] Create new Drawer / Sheet component`
- `ec04355f8` `[temporal] New Calendar component`
- `8e096be39` `[csp provider] Add CSPProvider`

### Existing components gained new parts, stores, or behaviors

- Popup-family components gained `Viewport` and store-oriented behavior, which affects `dialog`, `menu`, `popover`, `tooltip`, `preview-card`, `toast`, and later `drawer`.
- `combobox`, `autocomplete`, `select`, and `slider` gained additional parts such as `InputGroup` and `Label`.
- `select` gained `List` and other parity improvements that the Solid port must account for.
- Several components added detached-trigger support tests and extra popup/portal/viewport coverage.
- The React codebase increasingly relies on shared popup/store utilities rather than older component-local logic.

Relevant commits:

- `40aa1b017` `[dialogs] Add Viewport part with scrollable demos on docs`
- `6cebc00f8` `[menu] Implement content transitions with Viewport`
- `c3f6013e3` `[popups] Reuse Viewport logic across components`
- `26185fb1d` `[toasts] Introduce a store`
- `aeac4b050` `[menu] Keep state in a store`
- `26a0aa47f` `[tooltip] Keep state in a store`
- `a96f6bd7c` `[dialog][alert dialog] Keep state in a store`
- `24efc801a` `[combobox][autocomplete] Add InputGroup part`
- `ca0c6452f` `[select][combobox][slider] Add Label parts`
- `a08647ac4` `[select] Add Select.List component`

### Public API drift inside already-copied areas

These changes are especially important because the legacy Solid code already contains these components, but its API shape may now be stale:

- `navigation-menu`
  `keepMounted` on `Content`, generic `Value` typing, nested menu fixes, and several timing fixes.
- `tooltip`
  `closeOnClick` plus disabled-trigger fixes and store/viewport changes.
- `number-field`
  `allowOutOfRange` and changed commit/reason behavior.
- `tabs`
  transition attributes on `Tabs.Panel` and `keepMounted` fixes.
- `field`
  `Field.Item`, `actionsRef`, `nativeLabel`, `dirty`, `touched`, SSR and validation fixes.
- `switch`, `radio`, `accordion`
  new generic/value typing and labeling behavior.
- `select` and `combobox`
  `autoComplete`, `placeholder`, `null` values, object values, popup/input role fixes, label/list/value changes.

Representative commits:

- `7643c54b2` `[navigation menu] Add keepMounted prop to Content part`
- `55b27a66f` `[navigation menu] Add generic Value typing`
- `0fa1337b5` `[tooltip] Add closeOnClick prop`
- `c8fa08756` `[number field] Add allowOutOfRange prop`
- `52dd939ab` `[tabs] Add transition attributes to Tabs.Panel part`
- `91a6b14a1` `[field] New Field.Item part`
- `683308d21` `[form][field] Add actionsRef`
- `9466ac681` `[field] Add nativeLabel prop to Label component`
- `1fee870c1` `[switch] Add value prop`
- `8fbdf21c4` `[accordion] Add generic Value typing`
- `e937bccff` `[radio] Add generic Value typing to Radio`
- `72995b037` `[select][combobox] Add autoComplete prop`
- `8c13aa9ec` `[combobox][select] Add placeholder prop to Value part`
- `ac124a480` `[combobox][select] Add null as an option for the value prop`
- `83b60d381` `[select][combobox] Support object values with isItemEqualToValue prop`

### React test and verification drift

- React added a large amount of `.spec.tsx` coverage in addition to `.test.tsx`.
- Popup-family components now have more detached-trigger, portal, viewport, and nested-interaction tests.
- `test/public-types/` was added and should be mirrored for Solid public API validation once the package surface settles.
- Tests were normalized to Vitest-only APIs and removed Chai/Sinon-style usage.

New public type test package:

- `test/public-types/autocomplete.tsx`
- `test/public-types/checkbox.tsx`
- `test/public-types/combobox.tsx`
- `test/public-types/index.tsx`
- `test/public-types/menu.tsx`
- `test/public-types/separator.tsx`
- `test/public-types/toast.tsx`
- `test/public-types/use-render.tsx`

Relevant commit:

- `b015cd767` `[test] Remove chai and sinon from tests`

## Porting implications

### 1. React parity work is not only "new components"

Even copied components such as `select`, `tooltip`, `tabs`, `field`, `navigation-menu`, `toast`, and `dialog` require an upstream re-sync before the Solid 2 syntax migration is considered complete.

### 2. Popup-family components should be migrated as a cluster

`dialog`, `alert-dialog`, `popover`, `menu`, `select`, `tooltip`, `preview-card`, `toast`, and `drawer` now share more popup infrastructure and similar viewport/store behavior. Porting them together will reduce duplicate rewrites.

### 3. Form/input work should be grouped separately

`field`, `form`, `input`, `number-field`, `slider`, `combobox`, `autocomplete`, `radio`, `checkbox`, and `switch` have related labeling, hidden-input, and validation changes. They should be audited together.

### 4. Some legacy Solid code should probably be dropped

- `unstable-no-ssr` no longer matches the current React surface.
- `floating-ui-solid` must be kept only if it remains the right abstraction for current popup behavior; do not assume parity with `floating-ui-react`.

## Recommended migration order update

1. Re-sync shared popup infrastructure and popup-family components with current React behavior.
2. Re-sync form/input primitives and collection widgets with current React APIs.
3. Add missing public components: `button`, `combobox`, `autocomplete`, `drawer`, `calendar`.
4. Add provider and temporal support areas.
5. Mirror high-value React tests and then add Solid-specific regression coverage.
