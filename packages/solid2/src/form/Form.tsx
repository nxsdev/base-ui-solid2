import { createEffect, createMemo, createSignal, createTrackedEffect, flush } from 'solid-js';
import { createStore } from 'solid-js';
import { access, callEventHandler, splitComponentProps } from '../solid-helpers';
import type { BaseUIComponentProps } from '../utils/types';
import { useRenderElement } from '../utils/useRenderElement';
import { FormContext, type Errors, type FormValidationMode } from './FormContext';

const EMPTY_STATE = {};
const EMPTY_ERRORS: Errors = {};

/**
 * A native form element with consolidated error handling.
 * Renders a `<form>` element.
 *
 * Documentation: [Base UI Form](https://base-ui.com/react/components/form)
 */
export function Form(componentProps: Form.Props) {
  const [, local, elementProps] = splitComponentProps(componentProps, [
    'errors',
    'noValidate',
    'onClearErrors',
    'onSubmit',
    'validationMode',
  ]);
  const [formRef, setFormRef] = createStore<FormContext['formRef']>({ fields: {} });
  const [errorsOverride, setErrorsOverride] = createSignal<Form.Props['errors']>(undefined, {
    pureWrite: true,
  });
  const [submitAttempted, setSubmitAttempted] = createSignal(false);
  let submitted = false;
  let syncedExternalErrors = false;
  const validationMode = () => local.validationMode ?? 'onSubmit';

  const focusControl = (control: HTMLElement) => {
    control.focus();
    if (control.tagName === 'INPUT') {
      (control as HTMLInputElement).select();
    }
  };

  const getInvalidFields = () =>
    Object.values(formRef.fields).filter((field) => {
      const control = access(field.controlRef) as
        | (HTMLElement & { validity?: ValidityState | undefined })
        | null
        | undefined;

      if (control?.validity) {
        return control.validity.valid === false || field.validityData.state.valid === false;
      }

      return field.validityData.state.valid === false;
    });

  const invalidFields = createMemo(() => getInvalidFields());

  createEffect(
    () => local.errors,
    () => {
      if (syncedExternalErrors) {
        setErrorsOverride(undefined);
      } else {
        syncedExternalErrors = true;
      }
    },
  );

  createTrackedEffect(() => {
    const fields = invalidFields();
    if (!submitted) {
      return;
    }

    submitted = false;

    if (fields.length) {
      const controlRef = access(fields[0].controlRef);
      if (controlRef) {
        focusControl(controlRef);
      }
    }
  });

  const clearErrors = (name: string | undefined) => {
    const err = errorsOverride() ?? local.errors;
    if (name && err && EMPTY_STATE.hasOwnProperty.call(err, name)) {
      const nextErrors = { ...err };
      delete nextErrors[name];
      setErrorsOverride(nextErrors);
      local.onClearErrors?.(nextErrors);
      flush();
    }
  };

  const contextValue: FormContext = {
    formRef,
    setFormRef,
    errors: () => errorsOverride() ?? local.errors ?? EMPTY_ERRORS,
    clearErrors,
    validationMode,
    submitAttempted,
  };

  const element = useRenderElement('form', componentProps, {
    state: EMPTY_STATE,
    props: [
      {
        novalidate: local.noValidate ?? true,
        onSubmit(event) {
          setSubmitAttempted(true);

          // Async validation isn't supported to stop the submit event.
          Object.values(formRef.fields).forEach((field) => field.validate());
          const invalidFieldsNow = getInvalidFields();

          if (invalidFieldsNow.length) {
            event.preventDefault();
            const controlRef = access(invalidFieldsNow[0].controlRef);
            if (controlRef) {
              focusControl(controlRef);
            }
          } else {
            submitted = true;
            callEventHandler(local.onSubmit, event);
          }
        },
      },
      elementProps,
    ],
  });

  return <FormContext value={contextValue}>{element()}</FormContext>;
}

export namespace Form {
  export interface Props extends BaseUIComponentProps<'form', State> {
    /**
     * Determines when the form should be validated.
     * The `validationMode` prop on `<Field.Root>` takes precedence over this.
     *
     * - `onSubmit` (default): validates the field when the form is submitted, afterwards fields will re-validate on change.
     * - `onBlur`: validates a field when it loses focus.
     * - `onChange`: validates the field on every change to its value.
     * @default 'onSubmit'
     */
    validationMode?: FormValidationMode;
    /**
     * An object where the keys correspond to the `name` attribute of the form fields,
     * and the values correspond to the error(s) related to that field.
     */
    errors?: ReturnType<FormContext['errors']>;
    /**
     * Whether native form validation should be disabled.
     * @default true
     */
    noValidate?: boolean;
    /**
     * Event handler called when the internal `errors` object is cleared.
     *
     * This remains in the copied Solid baseline; React mainline has since moved to
     * internal error state synchronization without this callback.
     */
    onClearErrors?: (errors: ReturnType<FormContext['errors']>) => void;
  }
  export interface State {}
}
