import {
  createEffect,
  createMemo,
  createSignal,
  createTrackedEffect,
  omit,
  onSettled,
  merge as solidMergeProps,
} from 'solid-js';
import { useCheckboxGroupContext } from '../../checkbox-group/CheckboxGroupContext';
import { useFieldControlValidation } from '../../field/control/useFieldControlValidation';
import type { FieldRoot } from '../../field/root/FieldRoot';
import { useFieldRootContext } from '../../field/root/FieldRootContext';
import { useField } from '../../field/useField';
import { useFormContext } from '../../form/FormContext';
import { mergeProps } from '../../merge-props';
import { normalizeOptionalId, splitComponentProps } from '../../solid-helpers';
import { useButton } from '../../use-button/useButton';
import type { BaseUIComponentProps, BaseUIHTMLProps } from '../../utils/types';
import { useBaseUiId } from '../../utils/useBaseUiId';
import { useControlled } from '../../utils/useControlled';
import { useRenderElement } from '../../utils/useRenderElement';
import { visuallyHidden } from '../../utils/visuallyHidden';
import { useCustomStyleHookMapping } from '../utils/useCustomStyleHookMapping';
import { CheckboxRootContext } from './CheckboxRootContext';

export const PARENT_CHECKBOX = 'data-parent';

/**
 * Represents the checkbox itself.
 * Renders a `<button>` element and a hidden `<input>` beside.
 *
 * Documentation: [Base UI Checkbox](https://base-ui.com/react/components/checkbox)
 */
export function CheckboxRoot(componentProps: CheckboxRoot.Props) {
  const [, local, elementProps] = splitComponentProps(componentProps, [
    'checked',
    'defaultChecked',
    'disabled',
    'id',
    'indeterminate',
    'inputRef',
    'name',
    'onCheckedChange',
    'parent',
    'readOnly',
    'render',
    'required',
    'value',
    'nativeButton',
  ]);
  const checkedProp = () => local.checked;
  const defaultChecked = () => local.defaultChecked ?? false;
  const disabledProp = () => Boolean(local.disabled);
  const indeterminate = () => Boolean(local.indeterminate);
  const parent = () => Boolean(local.parent);
  const readOnly = () => Boolean(local.readOnly);
  const required = () => Boolean(local.required);
  const nativeButton = () => local.nativeButton ?? true;

  const { clearErrors } = useFormContext();
  const {
    disabled: fieldDisabled,
    labelId,
    name: fieldName,
    setDirty,
    setFilled,
    setFocused,
    setTouched,
    state: fieldState,
    validationMode,
    validityData,
    setCodependentRefs: setChildRefs,
  } = useFieldRootContext();

  const groupContext = useCheckboxGroupContext();
  const parentContext = () => groupContext?.parent;
  const isGrouped = createMemo(() => parentContext() && groupContext?.allValues());

  const disabled = () => fieldDisabled() || groupContext?.disabled() || disabledProp();
  const name = () => fieldName() ?? (typeof local.name === 'string' ? local.name : undefined);
  const value = () => (typeof local.value === 'string' ? local.value : undefined) ?? name();

  const groupProps = createMemo(() => {
    let mainProps = {} as Partial<Omit<CheckboxRoot.Props, 'class'>>;
    if (isGrouped()) {
      const currentValue = value();

      if (parent()) {
        mainProps = groupContext!.parent.getParentProps();
      }

      if (currentValue !== undefined) {
        mainProps = groupContext!.parent.getChildProps(currentValue);
      }
    }

    const otherGorup = omit(mainProps, 'checked', 'indeterminate', 'onCheckedChange');
    return {
      other: otherGorup,
      local: {
        get checked() {
          return mainProps.checked ?? checkedProp();
        },
        get indeterminate() {
          return mainProps.indeterminate ?? indeterminate();
        },
        // eslint-disable-next-line solid/reactivity
        onCheckedChange: mainProps.onCheckedChange,
      },
    };
  });

  const groupValue = () => groupContext?.value();
  const setGroupValue = groupContext?.setValue;
  const defaultGroupValue = () => groupContext?.defaultValue();

  const [controlRef, setControlRef] = createSignal<HTMLButtonElement | null | undefined>(null);

  const { getButtonProps, buttonRef } = useButton({
    disabled,
    native: nativeButton,
  });

  const localFieldControlValidation = useFieldControlValidation();
  const fieldControlValidation = () =>
    groupContext?.fieldControlValidation ?? localFieldControlValidation;

  const [checked, setCheckedState] = useControlled({
    controlled: () => {
      const currentValue = value();

      return currentValue !== undefined && groupValue() && !parent()
        ? groupValue()!.includes(currentValue)
        : groupProps().local.checked;
    },
    default: () => {
      const currentValue = value();

      return currentValue !== undefined && defaultGroupValue() && !parent()
        ? defaultGroupValue()!.includes(currentValue)
        : defaultChecked();
    },
    name: 'Checkbox',
    state: 'checked',
  });

  const id = useBaseUiId(() => local.id);

  onSettled(() => {
    setChildRefs((refs) => {
      refs.control = {
        explicitId: id,
        ref: controlRef,
        id: () => normalizeOptionalId(local.id),
      };
    });
  });

  useField({
    enabled: () => !groupContext,
    id,
    commitValidation: (...args) => fieldControlValidation().commitValidation(...args),
    value: checked,
    controlRef,
    name,
    getValue: () => checked(),
  });

  let inputRef = null as HTMLInputElement | null | undefined;

  createTrackedEffect(() => {
    if (inputRef) {
      inputRef.indeterminate = groupProps().local.indeterminate;
      if (checked()) {
        setFilled(true);
      }
    }
  });

  const onFocus = () => setFocused(true);

  const onBlur = () => {
    if (!inputRef) {
      return;
    }

    setTouched(true);
    setFocused(false);

    if (validationMode() === 'onBlur') {
      fieldControlValidation().commitValidation(groupContext ? groupValue() : inputRef.checked);
    }
  };

  const onClick = (event: Event) => {
    if (event.defaultPrevented || readOnly()) {
      return;
    }

    event.preventDefault();

    inputRef?.click();
  };

  const inputProps = createMemo<BaseUIHTMLProps<HTMLInputElement>>(() => {
    return mergeProps<'input'>(
      {
        get checked() {
          return checked();
        },
        get disabled() {
          return disabled();
        },
        // parent checkboxes unset `name` to be excluded from form submission
        get name() {
          return parent() ? undefined : name();
        },
        // Set `id` to stop Chrome warning about an unassociated input
        get id() {
          return `${id()}-input`;
        },
        get required() {
          return required();
        },
        ref: (el) => {
          inputRef = el;
          fieldControlValidation().refs.inputRef = el;
        },
        style: visuallyHidden,
        tabindex: -1,
        type: 'checkbox',
        'aria-hidden': 'true',
        onChange(event) {
          const groupContextValue = groupContext?.value();
          // Workaround for https://github.com/facebook/react/issues/9023
          if (event.defaultPrevented) {
            return;
          }

          const nextChecked = event.target.checked;
          setDirty(nextChecked !== validityData.initialValue);
          setCheckedState(nextChecked);
          groupProps().local.onCheckedChange?.(nextChecked, event);
          local.onCheckedChange?.(nextChecked, event);
          clearErrors(name());

          if (!groupContext) {
            setFilled(nextChecked);

            if (validationMode() === 'onChange') {
              fieldControlValidation().commitValidation(nextChecked);
            } else {
              fieldControlValidation().commitValidation(nextChecked, true);
            }
          }

          const currentValue = value();

          if (currentValue !== undefined && groupContextValue && setGroupValue && !parent()) {
            const nextGroupValue = nextChecked
              ? [...groupContextValue!, currentValue]
              : groupContextValue!.filter((item) => item !== currentValue);

            setGroupValue(nextGroupValue, event);
            setFilled(nextGroupValue.length > 0);

            if (validationMode() === 'onChange') {
              fieldControlValidation().commitValidation(nextGroupValue);
            } else {
              fieldControlValidation().commitValidation(nextGroupValue, true);
            }
          }
        },
        onFocus() {
          controlRef()?.focus();
        },
        // React <19 sets an empty value if `undefined` is passed explicitly
        // To avoid this, we only set the value if it's defined
        get value() {
          const explicitValue = typeof local.value === 'string' ? local.value : undefined;

          return explicitValue !== undefined
            ? groupContext
              ? checked() && explicitValue
                ? explicitValue
                : ''
              : explicitValue
            : undefined;
        },
      },

      groupContext
        ? fieldControlValidation().getValidationProps
        : fieldControlValidation().getInputValidationProps,
    );
  });
  const computedChecked = () => (isGrouped() ? Boolean(groupProps().local.checked) : checked());
  const computedIndeterminate = () =>
    isGrouped() ? groupProps().local.indeterminate || indeterminate() : indeterminate();

  createTrackedEffect(() => {
    const currentValue = value();
    if (parentContext() && currentValue !== undefined) {
      parentContext()?.disabledStatesRef.set(currentValue, disabled());
    }
  });

  const state: CheckboxRoot.State = solidMergeProps(fieldState, {
    get disabled() {
      return disabled();
    },
    get checked() {
      return computedChecked();
    },
    get readOnly() {
      return readOnly();
    },
    get required() {
      return required();
    },
    get indeterminate() {
      return computedIndeterminate();
    },
  });

  const customStyleHookMapping = useCustomStyleHookMapping(state);

  const element = useRenderElement('button', componentProps, {
    state,
    ref: (el) => {
      buttonRef(el);
      setControlRef(el);
      groupContext?.registerControlRef(el);
    },
    customStyleHookMapping,
    props: [
      {
        get id() {
          return id();
        },
        role: 'checkbox',
        get disabled() {
          return disabled() ? true : undefined;
        },
        get 'aria-checked'() {
          return groupProps().local.indeterminate ? 'mixed' : checked() ? 'true' : 'false';
        },
        get 'aria-readonly'() {
          return readOnly() ? 'true' : undefined;
        },
        get 'aria-required'() {
          return required() ? 'true' : undefined;
        },
        get 'aria-labelledby'() {
          return labelId();
        },
        get [PARENT_CHECKBOX as string]() {
          return parent() ? '' : undefined;
        },
        onFocus,
        onBlur,
        onClick,
      },
      (props) => fieldControlValidation().getValidationProps(props),
      elementProps,
      (props) => mergeProps(props, groupProps().other),
      getButtonProps,
    ],
  });

  return (
    <CheckboxRootContext value={state}>
      {element()}
      {!checked() && !groupContext && local.name && !parent() && (
        <input type="hidden" name={local.name} value="off" />
      )}
      <input {...(inputProps() as any)} />
    </CheckboxRootContext>
  );
}

export namespace CheckboxRoot {
  export interface State extends FieldRoot.State {
    /**
     * Whether the checkbox is currently ticked.
     */
    checked: boolean;
    /**
     * Whether the component should ignore user interaction.
     */
    disabled: boolean;
    /**
     * Whether the user should be unable to tick or untick the checkbox.
     */
    readOnly: boolean;
    /**
     * Whether the user must tick the checkbox before submitting a form.
     */
    required: boolean;
    /**
     * Whether the checkbox is in a mixed state: neither ticked, nor unticked.
     */
    indeterminate: boolean;
  }

  export interface Props extends Omit<BaseUIComponentProps<'button', State>, 'onChange'> {
    /**
     * Whether the checkbox is currently ticked.
     *
     * To render an uncontrolled checkbox, use the `defaultChecked` prop instead.
     * @default undefined
     */
    checked?: boolean;
    /**
     * Whether the checkbox is initially ticked.
     *
     * To render a controlled checkbox, use the `checked` prop instead.
     * @default false
     */
    defaultChecked?: boolean;
    /**
     * Event handler called when the checkbox is ticked or unticked.
     *
     * @param {boolean} checked The new checked state.
     * @param {Event} event The corresponding event that initiated the change.
     */
    onCheckedChange?: (checked: boolean, event: Event) => void;
    /**
     * Whether the user should be unable to tick or untick the checkbox.
     * @default false
     */
    readOnly?: boolean;
    /**
     * Whether the user must tick the checkbox before submitting a form.
     * @default false
     */
    required?: boolean;
    /**
     * Whether the checkbox is in a mixed state: neither ticked, nor unticked.
     * @default false
     */
    indeterminate?: boolean;
    /**
     * A ref to access the hidden `<input>` element.
     */
    inputRef?: HTMLInputElement | null | undefined;
    /**
     * Whether the checkbox controls a group of child checkboxes.
     *
     * Must be used in a [Checkbox Group](https://base-ui.com/react/components/checkbox-group).
     * @default false
     */
    parent?: boolean;
    /**
     * Whether the component renders a native `<button>` element when replacing it
     * via the `render` prop.
     * Set to `false` if the rendered element is not a button (e.g. `<div>`).
     * @default true
     */
    nativeButton?: boolean;
  }
}
