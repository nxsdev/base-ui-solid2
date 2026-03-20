import { type Accessor, type JSX } from 'solid-js';
import { access, type MaybeAccessor } from '../solid-helpers';

export function useFocusableWhenDisabled(
  parameters: useFocusableWhenDisabled.Parameters,
): useFocusableWhenDisabled.ReturnValue {
  const focusableWhenDisabled = () => access(parameters.focusableWhenDisabled);
  const disabled = () => access(parameters.disabled);
  const composite = () => access(parameters.composite) ?? false;
  const tabIndexProp = () => access(parameters.tabIndex) ?? 0;
  const isNativeButton = () => access(parameters.isNativeButton);

  const isFocusableComposite = () => composite?.() && focusableWhenDisabled?.() !== false;
  const isNonFocusableComposite = () => composite?.() && focusableWhenDisabled?.() === false;

  const props = {
    // allow Tabbing away from focusableWhenDisabled elements
    onKeyDown(event: KeyboardEvent) {
      if (disabled() && focusableWhenDisabled() && event.key !== 'Tab') {
        event.preventDefault();
      }
    },
    get tabIndex() {
      if (!composite()) {
        if (!isNativeButton() && disabled()) {
          return focusableWhenDisabled() ? tabIndexProp() : -1;
        }

        return tabIndexProp();
      }

      return undefined;
    },
    get 'aria-disabled'() {
      if (
        (isNativeButton() && (focusableWhenDisabled() || isFocusableComposite())) ||
        (!isNativeButton() && disabled())
      ) {
        return disabled() ? 'true' : undefined;
      }

      return undefined;
    },
    get disabled() {
      if (isNativeButton() && (!focusableWhenDisabled() || isNonFocusableComposite())) {
        return disabled();
      }

      return undefined;
    },
  } satisfies FocusableWhenDisabledProps;

  return { props };
}

export interface FocusableWhenDisabledProps {
  'aria-disabled'?: JSX.AriaAttributes['aria-disabled'];
  disabled?: boolean;
  onKeyDown: (event: KeyboardEvent) => void;
  tabIndex?: string | number;
}

export namespace useFocusableWhenDisabled {
  export interface Parameters {
    /**
     * Whether the component should be focusable when disabled.
     * When `undefined`, composite items are focusable when disabled by default.
     */
    focusableWhenDisabled?: MaybeAccessor<boolean | undefined>;
    /**
     * The disabled state of the component.
     */
    disabled: MaybeAccessor<boolean>;
    /**
     * Whether this is a composite item or not.
     * @default false
     */
    composite?: MaybeAccessor<boolean | undefined>;
    /**
     * @default 0
     */
    tabIndex?: MaybeAccessor<string | number | undefined>;
    /**
     * @default true
     */
    isNativeButton: MaybeAccessor<boolean>;
  }

  export interface ReturnValue {
    props: FocusableWhenDisabledProps;
  }
}
