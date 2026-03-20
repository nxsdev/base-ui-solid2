# Solid 2 Test Rewrite Notes

This memo records every test, test fixture, and shared test setup rewrite made while migrating `packages/solid2` from the copied Solid 1 baseline to Solid 2 beta.

The purpose of this document is to keep compatibility review auditable:

- what changed
- why it changed
- whether it was truly required
- why the React / Base UI public contract is still preserved

## Classification rules

Every rewrite is classified into one of these buckets.

1. Syntax migration only  
   Solid 2 changed or removed syntax such as `splitProps`, `Index`, `use:`, legacy tracked-effect usage, `For` item access, or ARIA pseudo-boolean typing. These rewrites keep the same assertion intent executable.

2. Observation migration only  
   The assertion target stayed the same, but the observation path changed because Solid 2 no longer tracks or exposes the old Solid 1 pattern in the same way.

3. Test infrastructure only  
   The test environment or shared setup changed so the `packages/solid2` test project can run.

4. Reverted API-drift masking rewrite  
   An earlier rewrite incorrectly changed a public Base UI / React-facing API expectation inside the test itself. Those rewrites were not valid Solid 2 migrations. They were reverted, and the implementation was updated instead.

## Self-review conclusion

The re-review found one invalid rewrite pattern:

- changing public API names such as `readOnly` -> `readonly`, `noValidate` -> `novalidate`, or `tabIndex` -> `tabindex` inside component and hook tests

That pattern mixed up:

- public component / hook API, which must remain React / Base UI-compatible
- rendered DOM attribute names, which may need Solid 2-compatible lowercase spelling at the actual DOM boundary

Those rewrites were reverted in the affected tests below. The implementation was updated to preserve the original public API while still rendering the correct lowercase DOM attributes where Solid 2 requires them.

## File-by-file inventory

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/checkbox/indicator/CheckboxIndicator.test.tsx`

- Earlier rewrite: changed local state key from `readOnly` to `readonly`.
- Final judgment: reverted API-drift masking rewrite.
- Why: this test is about the render-state contract key, which should remain `readOnly`; `getStyleHookProps` is responsible for lowercasing it to `data-readonly`.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/checkbox-group/CheckboxGroup.test.tsx`

- Replaced `errors={errors()}` with a getter-backed `formProps` object that is spread into `<Form>`.
- Final judgment: required observation migration.
- Why compatibility is preserved: the test still verifies the same server-error focus behavior; only the Solid 2 prop observation path changed.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/checkbox/root/CheckboxRoot.test.tsx`

- Earlier rewrite: changed the public prop under test from `readOnly` to `readonly`.
- Final judgment: reverted API-drift masking rewrite.
- Why: `Checkbox.Root` should still expose `readOnly` publicly even if the internal DOM boundary uses `readonly`.
- Additional rewrite: replaced `errors={errors()}` with a getter-backed `formProps` object for the `<Form>` fixture.
- Final judgment for the additional rewrite: required observation migration.
- Why compatibility is preserved: the checkbox error-clearing behavior under test is unchanged.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/floating-ui-solid/components/FloatingDelayGroup.test.tsx`

- Changed a local tooltip helper from `createEffect` to `createTrackedEffect`.
- Final judgment: required syntax migration.
- Why compatibility is preserved: the test still asserts the same delay-group behavior.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/floating-ui-solid/components/FloatingFocusManager.test.tsx`

- Replaced `use:autofocus` with `ref={(el) => autofocus(el, () => true)}`.
- Removed a local `batch(...)` wrapper in the fixture.
- Switched fixture JSX to Solid 2-compliant attribute spellings where needed.
- Final judgment: required syntax migration.
- Why compatibility is preserved: focus-management assertions are unchanged.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/floating-ui-solid/hooks/useDismiss.test.tsx`

- Removed `splitProps` from local dialog helpers.
- Switched helper reads from `local.*` to direct `props.*` reads.
- Final judgment: required syntax migration.
- Why compatibility is preserved: the same dismiss options and rendered output are asserted.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/floating-ui-solid/hooks/useListNavigation.test.tsx`

- Converted `aria-selected={boolean}` to explicit `'true' | 'false'`.
- Updated `For` item reads from `item` to `item()`.
- Final judgment: required syntax migration.
- Why compatibility is preserved: active-item semantics are unchanged.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/floating-ui-solid/hooks/useTypeahead.test.tsx`

- Converted `aria-selected={boolean}` to explicit `'true' | 'false'`.
- Updated `For` item rendering from `value` to `value()`.
- Final judgment: required syntax migration.
- Why compatibility is preserved: the same typeahead selection behavior is asserted.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/form/Form.test.tsx`

- Earlier rewrite: changed the public prop under test from `noValidate` to `novalidate`.
- Final judgment: reverted API-drift masking rewrite.
- Why: `Form` should keep `noValidate` as its public API and translate it to the native `novalidate` attribute internally.
- Additional rewrite: replaced `errors={errors()}` in local app fixtures with getter-backed `formProps` objects spread into `<Form>`.
- Final judgment for the additional rewrite: required observation migration.
- Why compatibility is preserved: the same error propagation, clearing, and focus semantics are asserted; only the Solid 2-compatible prop observation path changed. This includes the `prop: onClearErrors` fixture, where direct JSX props (`errors={errors()}`) were re-tested and found to become a non-reactive snapshot under Solid 2 beta, so the getter-backed fixture is required to keep the original controlled-errors contract observable.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/menu/checkbox-item/MenuCheckboxItem.test.tsx`

- Removed `splitProps` from the local logging helper.
- Final judgment: required syntax migration.
- Why compatibility is preserved: render-callback and prop-forwarding assertions are unchanged.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/menu/item/MenuItem.test.tsx`

- Same helper rewrite pattern as `MenuCheckboxItem.test.tsx`.
- Final judgment: required syntax migration.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/menu/radio-item/MenuRadioItem.test.tsx`

- Same helper rewrite pattern as `MenuCheckboxItem.test.tsx`.
- Final judgment: required syntax migration.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/menu/submenu-trigger/MenuSubmenuTrigger.test.tsx`

- Changed an assertion from `getAttribute('tabIndex')` to `getAttribute('tabindex')`.
- Final judgment: required syntax migration.
- Why: this is a serialized DOM attribute lookup, not a public component API change.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/merge-props/mergeProps.test.ts`

- Added explicit typing around class/style/classList test objects.
- Narrowed one proxy assertion from deep equality to explicit field checks.
- Rewrote the reactive getter case to observe merged props through direct reads after updates instead of `createMemo(() => mergedProps.*)`.
- Wrapped writes in `runWithOwner(null, ...)`.
- Final judgment: required observation migration.
- Why compatibility is preserved: the merged output contract under test did not change; only the Solid 2 observation path changed.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/number-field/decrement/NumberFieldDecrement.test.tsx`

- Earlier rewrite: changed the public prop under test from `readOnly` to `readonly`.
- Final judgment: reverted API-drift masking rewrite.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/number-field/increment/NumberFieldIncrement.test.tsx`

- Earlier rewrite: changed the public prop under test from `readOnly` to `readonly`.
- Final judgment: reverted API-drift masking rewrite.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/number-field/root/NumberFieldRoot.test.tsx`

- Earlier rewrite: changed the public prop under test from `readOnly` to `readonly`.
- Final judgment: reverted API-drift masking rewrite.
- Additional rewrite: replaced `errors={errors()}` with getter-backed `formProps` in the Form-driven fixtures.
- Final judgment for the additional rewrite: required observation migration.
- Why compatibility is preserved: the same Form-driven focus and error-clearing behavior is asserted.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/radio-group/RadioGroup.test.tsx`

- Earlier rewrite: changed the public prop under test from `readOnly` to `readonly`.
- Final judgment: reverted API-drift masking rewrite.
- Additional rewrite: replaced `errors={errors()}` with a getter-backed `formProps` object.
- Final judgment for the additional rewrite: required observation migration.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/select/root/SelectRoot.test.tsx`

- Updated `For` item rendering from `item` to `item()`.
- Final judgment: required syntax migration.
- Why compatibility is preserved: rendered labels and values are unchanged.
- Additional rewrite: replaced `errors={errors()}` with a getter-backed `formProps` object in the Form fixture.
- Final judgment for the additional rewrite: required observation migration.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/slider/root/SliderRoot.test.tsx`

- Earlier rewrite: changed the public prop under test from `tabIndex` to `tabindex`.
- Final judgment: reverted API-drift masking rewrite.
- Additional rewrite: replaced `errors={errors()}` with a getter-backed `formProps` object in the Form fixture.
- Final judgment for the additional rewrite: required observation migration.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/switch/root/SwitchRoot.test.tsx`

- Earlier rewrite: changed the public prop under test from `readOnly` to `readonly`.
- Final judgment: reverted API-drift masking rewrite.
- Additional rewrite: replaced `errors={errors()}` with a getter-backed `formProps` object in the Form fixture.
- Final judgment for the additional rewrite: required observation migration.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/switch/thumb/SwitchThumb.test.tsx`

- Earlier rewrite: changed local state key from `readOnly` to `readonly`.
- Final judgment: reverted API-drift masking rewrite.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/tabs/root/TabsRoot.test.tsx`

- Changed attribute lookup from `getAttribute('tabIndex')` to `getAttribute('tabindex')`.
- Final judgment: required syntax migration.
- Why compatibility is preserved: the roving-tabindex behavior being asserted is unchanged.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/toast/root/ToastRoot.test.tsx`

- Updated `For` item access from `toastItem` to `toastItem()`.
- Passed `toast={toastItem()}` instead of the accessor object itself.
- Final judgment: required syntax migration.
- Why compatibility is preserved: the same toast payload is rendered and asserted.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/toast/useToastManager.test.tsx`

- Same `For` accessor migration pattern as `ToastRoot.test.tsx`.
- Final judgment: required syntax migration.
- Why compatibility is preserved: the same toast manager payload and DOM output are asserted.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/use-button/useButton.test.tsx`

- Required rewrites:
  - removed `splitProps` from local helpers
  - normalized `disabled` to `Boolean(props.disabled)`
- Earlier invalid rewrite:
  - changed the public hook parameter under test from `tabIndex` to `tabindex`
- Final judgment: mixed; syntax migration kept, API-drift masking rewrite reverted.
- Why compatibility is preserved: the helper migration remains, while the hook's public API stays `tabIndex`.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/use-render/useRender.test.tsx`

- Replaced `splitProps` with plain destructuring in the local test harness.
- Final judgment: required syntax migration.
- Why compatibility is preserved: the same `render` contract is exercised.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/utils/getStyleHookProps.test.ts`

- Earlier rewrite: changed the input state key from `readOnly` to `readonly`.
- Final judgment: reverted API-drift masking rewrite.
- Why: the utility exists to lowercase keys itself, so the test should begin with `readOnly` and assert conversion to `data-readonly`.

## Floating UI fixture rewrites

### `/home/noc/oss/base-ui-solid2/packages/solid2/test/floating-ui-tests/ComplexGrid.tsx`

- Converted `aria-selected={boolean}` to explicit `'true' | 'false'`.
- Final judgment: required syntax migration.

### `/home/noc/oss/base-ui-solid2/packages/solid2/test/floating-ui-tests/EmojiPicker.tsx`

- Replaced a local `createEffect` with `createTrackedEffect`.
- Removed `splitProps` from `Option`.
- Converted `aria-selected={boolean}` to explicit string form.
- Final judgment: required syntax migration.

### `/home/noc/oss/base-ui-solid2/packages/solid2/test/floating-ui-tests/Grid.tsx`

- Converted `aria-selected={boolean}` to explicit `'true' | 'false'`.
- Final judgment: required syntax migration.

### `/home/noc/oss/base-ui-solid2/packages/solid2/test/floating-ui-tests/ListboxFocus.tsx`

- Converted `aria-selected={boolean}` to explicit `'true' | 'false'`.
- Final judgment: required syntax migration.

### `/home/noc/oss/base-ui-solid2/packages/solid2/test/floating-ui-tests/Menu.tsx`

- Replaced legacy tracked-effect patterns with `createTrackedEffect`.
- Removed `splitProps` from local fixture components.
- Converted `aria-hidden={!isOpen()}` to explicit string form.
- Final judgment: required syntax migration.

### `/home/noc/oss/base-ui-solid2/packages/solid2/test/floating-ui-tests/MenuOrientation.tsx`

- Same fixture migration pattern as `Menu.tsx`.
- Removed local `batch(...)` wrappers in the fixture.
- Final judgment: required syntax migration.

### `/home/noc/oss/base-ui-solid2/packages/solid2/test/floating-ui-tests/MenuVirtual.tsx`

- Same fixture migration pattern as `Menu.tsx`.
- Converted `aria-selected` / `aria-disabled` to Solid 2-compatible values.
- Final judgment: required syntax migration.

### `/home/noc/oss/base-ui-solid2/packages/solid2/test/floating-ui-tests/Navigation.tsx`

- Removed `splitProps` from local navigation fixture components.
- Final judgment: required syntax migration.

## Shared test setup

### `/home/noc/oss/base-ui-solid2/test/setupVitest.ts`

- Suppressed JSDOM's `Not implemented: HTMLFormElement's requestSubmit() method` console error in shared test setup.
- Final judgment: required test infrastructure migration.
- Why compatibility is preserved: JSDOM fires the `submit` event before emitting this not-implemented error. Swallowing the exact environment error keeps the existing submit semantics intact while preventing environment-only noise from failing the suite.

### `/home/noc/oss/base-ui-solid2/packages/solid2/test/createRenderer.ts`

- Reverted the shared test renderer from a `createComponent(...)` wrapper back to a `createDynamic(...)` wrapper.
- Final judgment: required test infrastructure migration.
- Why compatibility is preserved: this changes only how the test harness mounts component factories for `@solidjs/testing-library`; it does not alter Base UI public props, rendered semantics, or assertion intent.

### `/home/noc/oss/base-ui-solid2/packages/solid2/vitest.config.mts`

- Replaced package-local Solid alias paths with canonical realpaths resolved from the Solid 2 package entrypoints.
- Forced `@solidjs/testing-library` to its ESM entry so the test runner shares one Solid import graph.
- Final judgment: required test infrastructure migration.
- Why compatibility is preserved: this only deduplicates the test runtime's Solid module graph so package code and `@solidjs/testing-library` share the same Solid instance.

- Replaced `import { reset } from '@base-ui/utils/error'` with a workspace-relative source import.
- Final judgment: required test-infrastructure rewrite.
- Why compatibility is preserved: only package-local resolution changed; no component semantics changed.

- Added a package-local test setup file that calls `flush()` after `@solidjs/testing-library` event and async wrappers.
- Final judgment: required test infrastructure migration.
- Why compatibility is preserved: this does not change component code or public behavior; it only makes Solid 2 beta's deferred effect application visible to assertions after user/test interactions.

### `/home/noc/oss/base-ui-solid2/packages/solid2/test/setupSolidVitest.ts`

- Added shared `@solidjs/testing-library` wrapper configuration to `flush()` pending Solid 2 work after event and async callbacks.
- Final judgment: required test infrastructure migration.
- Why compatibility is preserved: this is a test-runner synchronization step only; it does not alter Base UI runtime semantics.

## Summary judgment

The current state of the migration uses three acceptable classes of test changes:

- Solid 2 syntax/runtime migration of tests and fixtures
- Observation-path migration where Solid 1 observation primitives no longer map directly
- Explicitly documented reversions of earlier test changes that had incorrectly hidden public API drift

No remaining rewrite in this file is intended to weaken:

- public prop names
- hook parameter names
- event ordering
- focus management semantics
- roving-tabindex behavior
- toast payload rendering
- menu / select / radio / switch / checkbox state semantics

If a future rewrite needs to change one of those public expectations, it must be documented here as a semantic divergence instead of being folded into migration noise.
