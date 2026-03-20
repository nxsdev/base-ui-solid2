import { createTrackedEffect, merge as solidMergeProps, type JSX } from 'solid-js';
import { mergeProps } from '../../merge-props';
import { normalizeOptionalId, splitComponentProps } from '../../solid-helpers';
import { useControlled } from '../../utils';
import { BaseUIComponentProps } from '../../utils/types';
import { useBaseUiId } from '../../utils/useBaseUiId';
import { useRenderElement } from '../../utils/useRenderElement';
import { FieldRoot } from '../root/FieldRoot';
import { useFieldRootContext } from '../root/FieldRootContext';
import { useField } from '../useField';
import { fieldValidityMapping } from '../utils/constants';
import { useFieldControlValidation } from './useFieldControlValidation';

/**
 * The form control to label and validate.
 * Renders an `<input>` element.
 *
 * You can omit this part and use any Base UI input component instead. For example,
 * [Input](https://base-ui.com/react/components/input), [Checkbox](https://base-ui.com/react/components/checkbox),
 * or [Select](https://base-ui.com/react/components/select), among others, will work with Field out of the box.
 *
 * Documentation: [Base UI Field](https://base-ui.com/react/components/field)
 */
export function FieldControl(componentProps: FieldControl.Props) {
  const [, local, elementProps] = splitComponentProps(componentProps, [
    'id',
    'name',
    'value',
    'disabled',
    'onValueChange',
    'defaultValue',
  ]);
  const disabledProp = () => Boolean(local.disabled);

  const { state: fieldState, name: fieldName, disabled: fieldDisabled } = useFieldRootContext();

  const disabled = () => fieldDisabled() || disabledProp();
  const name = () => fieldName() ?? (typeof local.name === 'string' ? local.name : undefined);

  const {
    labelId,
    setTouched,
    setDirty,
    validityData,
    setFocused,
    setFilled,
    validationMode,
    setCodependentRefs: setChildRefs,
  } = useFieldRootContext();

  const { getValidationProps, getInputValidationProps, commitValidation, refs } =
    useFieldControlValidation();

  const id = useBaseUiId(() => local.id);

  createTrackedEffect(() => {
    const explicitValue = typeof local.value === 'string' ? local.value : undefined;
    const hasExternalValue = explicitValue != null;
    if (refs.inputRef?.value || (hasExternalValue && explicitValue !== '')) {
      setFilled(true);
    } else if (hasExternalValue && explicitValue === '') {
      setFilled(false);
    }
  });

  const [value, setValueUnwrapped] = useControlled({
    controlled: () => local.value,
    default: () => local.defaultValue,
    name: 'FieldControl',
    state: 'value',
  });

  const setValue = (nextValue: string, event: Event) => {
    setValueUnwrapped(nextValue);
    local.onValueChange?.(nextValue, event);
  };

  useField({
    id,
    name,
    commitValidation,
    value,
    getValue: () => refs.inputRef?.value,
    controlRef: () => refs.inputRef,
  });

  const controlState: FieldControl.State = solidMergeProps(fieldState, {
    get disabled() {
      return disabled();
    },
  });

  const element = useRenderElement('input', componentProps, {
    state: controlState,
    ref: (el) => {
      refs.inputRef = el;
      setChildRefs((childRefs) => {
        childRefs.control = {
          explicitId: id,
          ref: () => refs.inputRef,
          id: () => normalizeOptionalId(local.id),
        };
      });
    },
    customStyleHookMapping: fieldValidityMapping,
    props: [
      {
        get id() {
          return id();
        },
        get disabled() {
          return disabled() ? true : undefined;
        },
        get name() {
          return name();
        },
        get 'aria-labelledby'() {
          return labelId();
        },
        get value() {
          return value();
        },
        onChange(event) {
          if (value() != null) {
            setValue(event.currentTarget.value, event);
          }

          setDirty(event.currentTarget.value !== validityData.initialValue);
          setFilled(event.currentTarget.value !== '');
        },
        onFocus() {
          setFocused(true);
        },
        onBlur(event) {
          setTouched(true);
          setFocused(false);

          if (validationMode() === 'onBlur') {
            commitValidation(event.currentTarget.value);
          }
        },
        onKeyDown(event) {
          if (event.currentTarget.tagName === 'INPUT' && event.key === 'Enter') {
            setTouched(true);
            commitValidation(event.currentTarget.value);
          }
        },
      },
      (props) => mergeProps(props, getValidationProps()),
      (props) => mergeProps(props, getInputValidationProps()),
      elementProps,
    ],
  });

  return <>{element()}</>;
}

export namespace FieldControl {
  export type State = FieldRoot.State;

  export interface Props extends BaseUIComponentProps<'input', State> {
    /**
     * Callback fired when the `value` changes. Use when controlled.
     */
    onValueChange?: (value: string, event: Event) => void;
    defaultValue?: JSX.InputHTMLAttributes<HTMLInputElement>['value'];
  }
}
