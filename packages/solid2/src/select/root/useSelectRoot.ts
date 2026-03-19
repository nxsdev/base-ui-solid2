import {
  createEffect,
  createTrackedEffect,
  onSettled,
  type Accessor,
  type JSX,
} from 'solid-js';
import { createStore } from 'solid-js';
import { useFieldControlValidation } from '../../field/control/useFieldControlValidation';
import { useFieldRootContext } from '../../field/root/FieldRootContext';
import { useField } from '../../field/useField';
import {
  FloatingRootContext,
  useClick,
  useDismiss,
  useFloatingRootContext,
  useInteractions,
  useListNavigation,
  useRole,
  useTypeahead,
} from '../../floating-ui-solid';
import { useFormContext } from '../../form/FormContext';
import { access, type MaybeAccessor } from '../../solid-helpers';
import { useTransitionStatus } from '../../utils';
import {
  translateOpenChangeReason,
  type BaseOpenChangeReason,
} from '../../utils/translateOpenChangeReason';
import { useBaseUiId } from '../../utils/useBaseUiId';
import { useControlled } from '../../utils/useControlled';
import { useOnFirstRender } from '../../utils/useOnFirstRender';
import { useOpenChangeComplete } from '../../utils/useOpenChangeComplete';
import { useTimeout } from '../../utils/useTimeout';
import { warn } from '../../utils/warn';
import type { SelectStore } from '../store';
import type { SelectRootContext } from './SelectRootContext';

export type SelectOpenChangeReason = BaseOpenChangeReason | 'window-resize';

const EMPTY_ARRAY: never[] = [];

export function useSelectRoot<T>(params: useSelectRoot.Parameters<T>): useSelectRoot.ReturnValue {
  const idProp = () => access(params.id);
  const disabledProp = () => access(params.disabled) ?? false;
  const readonly = () => access(params.readonly) ?? false;
  const required = () => access(params.required) ?? false;
  const modal = () => access(params.modal) ?? false;
  const nameProp = () => access(params.name);
  const items = () => access(params.items);
  const actionsRef = () => access(params.actionsRef);

  const { clearErrors } = useFormContext();
  const {
    setDirty,
    validationMode,
    setFilled,
    name: fieldName,
    disabled: fieldDisabled,
    setCodependentRefs,
  } = useFieldRootContext();
  const fieldControlValidation = useFieldControlValidation();

  const id = useBaseUiId(idProp);

  const disabled = () => fieldDisabled() || disabledProp();
  const name = () => fieldName() ?? nameProp();

  const [value, setValueUnwrapped] = useControlled({
    controlled: () => access(params.value),
    default: () => access(params.defaultValue),
    name: 'Select',
    state: 'value',
  });

  const [open, setOpenUnwrapped] = useControlled({
    controlled: () => access(params.open),
    default: () => access(params.defaultOpen),
    name: 'Select',
    state: 'open',
  });

  const refs: SelectRootContext['refs'] = {
    listRef: [],
    labelsRef: [],
    popupRef: null,
    valueRef: null,
    valuesRef: [],
    typingRef: false,
    keyboardActiveRef: false,
    selectedItemTextRef: null,
    alignItemWithTriggerActiveRef: false,
    selectionRef: {
      allowSelectedMouseUp: false,
      allowUnselectedMouseUp: false,
      allowSelect: false,
    },
  };

  const highlightTimeout = useTimeout();

  const { mounted, setMounted, transitionStatus } = useTransitionStatus(open);
  const [store, setStore] = createStore<SelectStore>({
    id: id(),
    modal: modal(),
    value: value(),
    label: '',
    open: open(),
    mounted: mounted(),
    forceMount: false,
    transitionStatus: transitionStatus(),
    items: items(),
    touchModality: false,
    activeIndex: null,
    selectedIndex: null,
    popupProps: {},
    triggerProps: {},
    triggerElement: null,
    positionerElement: null,
    scrollUpArrowVisible: false,
    scrollDownArrowVisible: false,
  });

  const isActive = (index: number) => store.activeIndex === index;
  const isSelected = ([index, itemValue]: [index: number, value: any]) =>
    store.selectedIndex === index && store.value === itemValue;

  const initialValueRef = value();
  createEffect(
    () => value(),
    (nextValue) => {
    // Ensure the values and labels are registered for programmatic value changes.
      if (nextValue !== initialValueRef) {
        setStore((state) => {
          state.forceMount = true;
        });
      }
    },
  );

  const commitValidation = fieldControlValidation.commitValidation;

  onSettled(() => {
    setCodependentRefs((refs) => {
      refs.control = { explicitId: id, ref: () => store.triggerElement, id: idProp };
    });
  });

  useField({
    id,
    commitValidation,
    value,
    controlRef: () => store.triggerElement,
    name,
    getValue: value,
  });

  let prevValueRef = value();

  createTrackedEffect(() => {
    const nextValue = value();

    setFilled(nextValue !== null);

    if (prevValueRef === nextValue) {
      return;
    }

    const index = refs.valuesRef.indexOf(nextValue);

    setStore((state) => {
      state.selectedIndex = index === -1 ? null : index;
      state.label = refs.labelsRef[index] ?? '';
    });

    clearErrors(name());
    setDirty(nextValue !== initialValueRef);
    commitValidation(nextValue, validationMode() !== 'onChange');

    if (validationMode() === 'onChange') {
      commitValidation(nextValue);
    }

    prevValueRef = nextValue;
  });

  const setOpen = (
    nextOpen: boolean,
    event: Event | undefined,
    reason: SelectOpenChangeReason | undefined,
  ) => {
    params.onOpenChange?.(nextOpen, event, reason);
    setOpenUnwrapped(nextOpen);

    // Workaround `enableFocusInside` in Floating UI setting `tabindex=0` of a non-highlighted
    // option upon close when tabbing out due to `keepMounted=true`:
    // https://github.com/floating-ui/floating-ui/pull/3004/files#diff-962a7439cdeb09ea98d4b622a45d517bce07ad8c3f866e089bda05f4b0bbd875R194-R199
    // This otherwise causes options to retain `tabindex=0` incorrectly when the popup is closed
    // when tabbing outside.
    if (!nextOpen && store.activeIndex !== null) {
      const activeOption = refs.listRef[store.activeIndex];
      // Wait for Floating UI's focus effect to have fired
      queueMicrotask(() => {
        activeOption?.setAttribute('tabindex', '-1');
      });
    }
  };

  const handleUnmount = () => {
    setMounted(false);
    setStore((state) => {
      state.activeIndex = null;
    });
    params.onOpenChangeComplete?.(false);
  };

  useOpenChangeComplete({
    enabled: () => !actionsRef(),
    open,
    ref: () => refs.popupRef,
    onComplete() {
      if (!open()) {
        handleUnmount();
      }
    },
  });

  onSettled(() => {
    if (actionsRef()) {
      actionsRef()!.unmount = handleUnmount;
    }
  });

  const setValue = (nextValue: any, event?: Event) => {
    params.onValueChange?.(nextValue, event);
    setValueUnwrapped(nextValue);
  };

  let hasRegisteredRef = false;

  const registerSelectedItem = (suppliedIndex: number | undefined) => {
    if (suppliedIndex !== undefined) {
      hasRegisteredRef = true;
    }

    const index = suppliedIndex ?? refs.valuesRef.indexOf(value());
    const hasIndex = index !== -1;

    if (hasIndex || value() === null) {
      setStore((state) => {
        state.selectedIndex = index;
        state.label = hasIndex ? (refs.labelsRef[index] ?? '') : '';
      });
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      if (value()) {
        const stringValue =
          typeof value() === 'string' || value() === null ? value() : JSON.stringify(value());
        warn(`The value \`${stringValue}\` is not present in the select items.`);
      }
    }
  };

  createEffect(
    () => value(),
    () => {
      if (!hasRegisteredRef) {
        return;
      }

      registerSelectedItem(undefined);
    },
  );

  const floatingContext = useFloatingRootContext({
    open,
    onOpenChange(nextOpen, event, reason) {
      setOpen(nextOpen, event, translateOpenChangeReason(reason));
    },
    elements: {
      reference: () => store.triggerElement,
      floating: () => store.positionerElement,
    },
  });

  const click = useClick(floatingContext, {
    enabled: () => !readonly() && !disabled(),
    event: 'mousedown',
  });

  const dismiss = useDismiss(floatingContext, {
    bubbles: false,
    outsidePressEvent: 'mousedown',
  });

  const role = useRole(floatingContext, {
    role: 'select',
  });

  const listNavigation = useListNavigation(floatingContext, {
    enabled: () => !readonly() && !disabled(),
    listRef: () => refs.listRef,
    activeIndex: () => store.activeIndex,
    selectedIndex: () => store.selectedIndex,
    disabledIndices: EMPTY_ARRAY,
    onNavigate(nextActiveIndex) {
      // Retain the highlight while transitioning out.
      if (nextActiveIndex === null && !open()) {
        return;
      }

      setStore((state) => {
        state.activeIndex = nextActiveIndex;
      });
    },
    // Implement our own listeners since `onPointerLeave` on each option fires while scrolling with
    // the `alignItemWithTrigger=true`, causing a performance issue on Chrome.
    focusItemOnHover: false,
  });

  const typeahead = useTypeahead(floatingContext, {
    enabled: () => !readonly() && !disabled(),
    listRef: () => refs.labelsRef,
    activeIndex: () => store.activeIndex,
    selectedIndex: () => store.selectedIndex,
    onMatch(index) {
      if (open()) {
        setStore((state) => {
          state.activeIndex = index;
        });
      } else {
        setValue(refs.valuesRef[index]);
      }
    },
    onTypingChange(typing) {
      // FIXME: Floating UI doesn't support allowing space to select an item while the popup is
      // closed and the trigger isn't a native <button>.
      refs.typingRef = typing;
    },
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    click,
    dismiss,
    role,
    listNavigation,
    typeahead,
  ]);

  useOnFirstRender(() => {
    // These should be initialized at store creation, but there is an interdependency
    // between some values used in floating hooks above.
    setStore((state) => {
      state.popupProps = getFloatingProps();
      state.triggerProps = getReferenceProps();
    });
  });

  // Store values that depend on other hooks
  createEffect(
    () => ({
      id: id(),
      modal: modal(),
      value: value(),
      open: open(),
      mounted: mounted(),
      transitionStatus: transitionStatus(),
      popupProps: getFloatingProps(),
      triggerProps: getReferenceProps(),
    }),
    (nextState) => {
      setStore((state) => {
        state.id = nextState.id;
        state.modal = nextState.modal;
        state.value = nextState.value;
        state.open = nextState.open;
        state.mounted = nextState.mounted;
        state.transitionStatus = nextState.transitionStatus;
        state.popupProps = nextState.popupProps;
        state.triggerProps = nextState.triggerProps;
      });
    },
  );

  const rootContext: SelectRootContext = {
    store,
    setStore,
    selectors: {
      isActive,
      isSelected,
    },
    name,
    required,
    disabled,
    readonly,
    setValue,
    setOpen,
    refs,
    getItemProps,
    events: floatingContext.events,
    fieldControlValidation,
    registerSelectedItem,
    onOpenChangeComplete: params.onOpenChangeComplete,
    highlightTimeout,
  };

  return {
    rootContext,
    floatingContext,
    value,
  };
}

export namespace useSelectRoot {
  export interface Parameters<Value> {
    /**
     * Identifies the field when a form is submitted.
     */
    name?: MaybeAccessor<string | undefined>;
    /**
     * The id of the Select.
     */
    id?: MaybeAccessor<string | undefined>;
    /**
     * Whether the user must choose a value before submitting a form.
     * @default false
     */
    required?: MaybeAccessor<boolean | undefined>;
    /**
     * Whether the user should be unable to choose a different option from the select menu.
     * @default false
     */
    readonly?: MaybeAccessor<boolean | undefined>;
    /**
     * Whether the component should ignore user interaction.
     * @default false
     */
    disabled?: MaybeAccessor<boolean | undefined>;
    /**
     * The value of the select.
     */
    value?: MaybeAccessor<Value | null | undefined>;
    /**
     * Callback fired when the value of the select changes. Use when controlled.
     */
    onValueChange?: (value: Value, event?: Event) => void;
    /**
     * The uncontrolled value of the select when it’s initially rendered.
     *
     * To render a controlled select, use the `value` prop instead.
     * @default null
     */
    defaultValue?: MaybeAccessor<Value | null | undefined>;
    /**
     * Whether the select menu is initially open.
     *
     * To render a controlled select menu, use the `open` prop instead.
     * @default false
     */
    defaultOpen?: MaybeAccessor<boolean | undefined>;
    /**
     * Event handler called when the select menu is opened or closed.
     * @type (open: boolean, event?: Event, reason?: Select.Root.OpenChangeReason) => void
     */
    onOpenChange?: (
      open: boolean,
      event: Event | undefined,
      reason: SelectOpenChangeReason | undefined,
    ) => void;
    /**
     * Event handler called after any animations complete when the select menu is opened or closed.
     */
    onOpenChangeComplete?: (open: boolean) => void;
    /**
     * Whether the select menu is currently open.
     */
    open?: MaybeAccessor<boolean | undefined>;
    /**
     * Determines if the select enters a modal state when open.
     * - `true`: user interaction is limited to the select: document page scroll is locked and and pointer interactions on outside elements are disabled.
     * - `false`: user interaction with the rest of the document is allowed.
     * @default true
     */
    modal?: MaybeAccessor<boolean | undefined>;
    /**
     * A ref to imperative actions.
     * - `unmount`: When specified, the select will not be unmounted when closed.
     * Instead, the `unmount` function must be called to unmount the select manually.
     * Useful when the select's animation is controlled by an external library.
     */
    actionsRef?: MaybeAccessor<Actions | undefined>;
    /**
     * Data structure of the items rendered in the select menu.
     * When specified, `<Select.Value>` renders the label of the selected item instead of the raw value.
     * @example
     * ```tsx
     * const items = {
     *   sans: 'Sans-serif',
     *   serif: 'Serif',
     *   mono: 'Monospace',
     *   cursive: 'Cursive',
     * };
     * <Select.Root items={items} />
     * ```
     */
    items?: MaybeAccessor<
      Record<string, JSX.Element> | Array<{ label: JSX.Element; value: Value }> | undefined
    >;
  }

  export type ReturnValue = {
    rootContext: SelectRootContext;
    floatingContext: FloatingRootContext;
    value: Accessor<any>;
  };

  export interface Actions {
    unmount: () => void;
  }
}
