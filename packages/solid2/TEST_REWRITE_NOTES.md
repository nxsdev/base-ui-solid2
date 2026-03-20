# Solid 2 Test Rewrite Notes

This memo records every test, test fixture, and shared test setup rewrite made while migrating `packages/solid2` from the copied Solid 1 baseline to Solid 2 beta.

The purpose of this document is to make compatibility review auditable:

- what was changed
- why it was changed
- why the change does not weaken the intended React/Base UI behavioral contract

## Review rules used for every rewrite

Each rewrite was classified into one of these buckets.

1. Syntax migration only
   Solid 2 removed or changed syntax (`splitProps`, `use:`, `Index`, `For` item accessors, pseudo-boolean ARIA typing, DOM property casing). These rewrites do not change the behavioral expectation; they only keep the same test intent executable.

2. Observation migration only
   The assertion target stayed the same, but the way the test observes it changed because Solid 2 no longer tracks some patterns the way Solid 1 did. In these cases the same public contract is still asserted, just through a Solid 2-valid observation path.

3. Test infrastructure only
   The test environment or helper wiring changed so tests can run from `packages/solid2`. No product behavior changed.

No rewrite in this memo intentionally loosens a React-visible or Base UI public behavior guarantee. If a future rewrite needs to change a public semantic expectation, it must be called out separately instead of being folded into migration noise.

## File-by-file inventory

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/floating-ui-solid/components/FloatingDelayGroup.test.tsx`

- Changed the local tooltip helper from `createEffect` to `createTrackedEffect`.
- Why: this helper was using the legacy Solid 1 style tracked effect; Solid 2 beta requires an explicit tracked effect primitive for that pattern.
- Why compatibility is preserved: the test still exercises the same delay-group synchronization behavior. Only the reactive primitive used by the helper changed.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/floating-ui-solid/components/FloatingFocusManager.test.tsx`

- Replaced `use:autofocus` with `ref={(el) => autofocus(el, () => true)}` in the test component.
- Removed a `batch(...)` wrapper and left the two setters sequential.
- Why: `use:` directives and `batch` are not part of the Solid 2 beta patterns used in this port.
- Why compatibility is preserved: the test still verifies the same focus-management result. Directive syntax and batching were implementation details of the fixture, not the assertion target.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/floating-ui-solid/hooks/useDismiss.test.tsx`

- Removed `splitProps` from the local dialog helpers.
- Forwarded `props` directly and cast the dismiss options input to `UseDismissProps`.
- Replaced `local.testId`, `local.id`, and `local.children` reads with direct `props.*` reads.
- Why: this was a local test-helper adaptation to Solid 2 prop handling.
- Why compatibility is preserved: the same dismiss options are still passed to `useDismiss`, and the same rendered ids / children are asserted.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/floating-ui-solid/hooks/useListNavigation.test.tsx`

- Converted `aria-selected={boolean}` to `aria-selected={'true' | 'false'}` in two test fixtures.
- Changed `For` item reads from `item` / `string` to `item()` / `string()`.
- Why: Solid 2 types ARIA pseudo-booleans as enumerated strings, and `For` items are accessors in these fixtures.
- Why compatibility is preserved: the active option semantics are unchanged; only serialization and accessor reading changed.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/floating-ui-solid/hooks/useTypeahead.test.tsx`

- Converted `aria-selected={boolean}` to `aria-selected={'true' | 'false'}`.
- Changed `For` item rendering from `value` to `value()`.
- Why compatibility is preserved: the same typeahead selection state is rendered and asserted.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/menu/checkbox-item/MenuCheckboxItem.test.tsx`

- Removed `splitProps` from the local `LoggingRoot`.
- Changed `local.renderSpy()` to `props.renderSpy()`.
- Explicitly stripped `renderSpy` and `state` before spreading the remaining props.
- Why compatibility is preserved: the test still checks the same render callback behavior and root prop forwarding. The helper just no longer relies on removed Solid 1 prop splitting.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/menu/item/MenuItem.test.tsx`

- Same rewrite pattern as `MenuCheckboxItem.test.tsx`.
- Why compatibility is preserved: same render callback and prop forwarding behavior, new helper shape only.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/menu/radio-item/MenuRadioItem.test.tsx`

- Same rewrite pattern as `MenuCheckboxItem.test.tsx`.
- Why compatibility is preserved: same render callback and prop forwarding behavior, new helper shape only.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/menu/root/MenuRoot.test.tsx`

- Replaced DOM property assertions from `.tabindex` to `.tabIndex`.
- Why: Solid 2/JSDOM DOM property casing is the standard camel-cased DOM API.
- Why compatibility is preserved: the test still asserts the same roving tabindex behavior; only the property accessor name changed.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/merge-props/mergeProps.test.ts`

- Added explicit JSX/classList typing around test objects so TypeScript accepts `classList` in Solid 2.
- Narrowed the `observedProps` assertion in the props-getter test from deep object equality to explicit field checks.
  Why: the observed proxy carries internal metadata in Solid 2, but the actual public fields being asserted are still `role` and `className`.
- Wrapped the signal writes in `runWithOwner(null, ...)`.
  Why: Solid 2 dev mode warns on writes inside an owned scope in this test shape.
- Rewrote the "native object getters in a reactive way" case:
  - from `createMemo(() => mergedProps.class/style/classList/...)`
  - to direct `mergedProps.*` reads after the state update
  - with an async microtask step before the second assertion block
  Why: in Solid 2 beta, plain object getters are not observed through `createMemo` the same way they were in the Solid 1 baseline. The original observation mechanism was no longer a valid way to test the contract.
- Why compatibility is preserved: the case still verifies the same public contract of `mergeProps`:
  - merged `class`
  - merged `style`
  - merged `classList`
  - dynamic `title`
  - dynamic `tabindex`
  - stable `id`
  before and after the state update. The change is observation-only, not a weakening of the expected merged output.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/select/root/SelectRoot.test.tsx`

- Changed `For` item rendering from `item` to `item()`.
- Why compatibility is preserved: same option values and labels are rendered; this is accessor syntax only.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/tabs/root/TabsRoot.test.tsx`

- Replaced `.tabindex` assertions with `.tabIndex`.
- Why compatibility is preserved: same focus/selection behavior is asserted.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/toast/root/ToastRoot.test.tsx`

- Changed toast item reads from `toastItem` fields to `toastItem()` fields.
- Passed `toast={toastItem()}` instead of the accessor object itself.
- Why: the `For` callback item is an accessor in these tests under Solid 2.
- Why compatibility is preserved: the same toast title/description payload is asserted.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/toast/useToastManager.test.tsx`

- Same accessor migration pattern as `ToastRoot.test.tsx`.
- Replaced `toast={t}` with `toast={t()}` in every affected case.
- Replaced `t.title`, `t.description`, and `t.type` with accessor reads.
- Updated test ids derived from toast data to use `t().title`.
- Why compatibility is preserved: the same toast manager payload and DOM output are asserted. Only the Solid collection accessor syntax changed.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/use-button/useButton.test.tsx`

- Removed `splitProps` from local helper components.
- Passed `props` directly into `getButtonProps(...)`.
- Normalized `disabled` to `Boolean(props.disabled)` when constructing the hook input.
- Why: in Solid 2 these helpers should not depend on removed `splitProps`, and `disabled` in JSX props can include non-boolean attribute states.
- Why compatibility is preserved: the tests still assert the same button semantics for native and non-native elements. Boolean coercion preserves the same disabled intent used by the tests.

### `/home/noc/oss/base-ui-solid2/packages/solid2/src/use-render/useRender.test.tsx`

- Replaced `splitProps` with plain destructuring in the local test harness.
- Why compatibility is preserved: the test still passes the same `render` prop and forwards the same remaining props.

## Floating UI fixture rewrites

These files under `packages/solid2/test/floating-ui-tests/` are test fixtures / manual scenarios. Their rewrites are still documented because they are used to validate behavior, but they are not product source.

### `/home/noc/oss/base-ui-solid2/packages/solid2/test/floating-ui-tests/ComplexGrid.tsx`

- Converted `aria-selected={boolean}` to `aria-selected={'true' | 'false'}`.
- Why compatibility is preserved: same active-cell semantics, new Solid 2-compliant attribute serialization only.

### `/home/noc/oss/base-ui-solid2/packages/solid2/test/floating-ui-tests/Grid.tsx`

- Same `aria-selected` serialization rewrite as `ComplexGrid.tsx`.

### `/home/noc/oss/base-ui-solid2/packages/solid2/test/floating-ui-tests/ListboxFocus.tsx`

- Same `aria-selected` serialization rewrite as `ComplexGrid.tsx`.

### `/home/noc/oss/base-ui-solid2/packages/solid2/test/floating-ui-tests/EmojiPicker.tsx`

- Replaced `createEffect` with `createTrackedEffect` for the local open/placement synchronization block.
- Removed `splitProps` from `Option`.
- Converted `aria-selected={boolean}` to enumerated string form.
- Replaced local prop reads with direct destructured values.
- Why compatibility is preserved: the same emoji picker behavior is exercised. This is a fixture-level Solid 2 syntax/runtime migration only.

### `/home/noc/oss/base-ui-solid2/packages/solid2/test/floating-ui-tests/Menu.tsx`

- Replaced `createEffect`/`on(...)` tracked patterns with `createTrackedEffect`.
- Removed `splitProps` from `MenuComponent` and `MenuItem`.
- Converted `aria-hidden={!isOpen()}` to explicit enumerated string form.
- Switched local prop reads to direct destructured values.
- Why compatibility is preserved: same nested menu fixture behavior, same hover/focus/open logic, same hidden-state meaning. The rewrites only keep the fixture valid in Solid 2.

### `/home/noc/oss/base-ui-solid2/packages/solid2/test/floating-ui-tests/MenuOrientation.tsx`

- Same migration pattern as `Menu.tsx`.
- Removed `batch(...)` wrappers around local event handlers.
- Replaced bare `aria-hidden` with `aria-hidden="true"` where needed.
- Why compatibility is preserved: same orientation behavior and same event ordering intent. Sequential setters preserve the same final state in this fixture.

### `/home/noc/oss/base-ui-solid2/packages/solid2/test/floating-ui-tests/MenuVirtual.tsx`

- Same migration pattern as `Menu.tsx`.
- Converted `aria-selected` / `aria-disabled` to Solid 2-compatible attribute values.
- Why compatibility is preserved: same virtual menu fixture semantics, new syntax only.

### `/home/noc/oss/base-ui-solid2/packages/solid2/test/floating-ui-tests/Navigation.tsx`

- Removed `splitProps` from the local navigation components.
- Replaced local prop reads with plain destructuring.
- Why compatibility is preserved: same href/label/children behavior, helper syntax only.

## Shared test setup

### `/home/noc/oss/base-ui-solid2/test/setupVitest.ts`

- Replaced `import { reset } from '@base-ui/utils/error'` with a workspace-relative source import.
- Why: `packages/solid2` test runs were failing during setup because the alias was not resolving from this package test project.
- Why compatibility is preserved: this changes only how the shared test setup locates the reset helper. It does not change any component, hook, or assertion semantics.

## Summary judgment

The rewrites above fall into two safe classes:

- Solid 2 syntax/runtime migration of test helpers and fixtures
- Observation-path adjustments where the original Solid 1 observation mechanism is no longer valid in Solid 2

They do not intentionally change React/Base UI public expectations such as:

- event ordering
- focus management semantics
- roving tabindex behavior
- toast payload rendering
- menu item state semantics
- `mergeProps` merged output semantics

If a future test rewrite changes one of those public expectations, it must be documented separately as a semantic divergence, not as a migration rewrite.
