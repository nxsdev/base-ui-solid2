import { createContext, useContext, type Accessor } from 'solid-js';
import type { StoreSetter, Store } from 'solid-js';
import type { FieldValidityData } from '../field/root/FieldRoot';
import type { MaybeAccessor } from '../solid-helpers';
import { NOOP } from '../utils/noop';

export type Errors = Record<string, string | string[]>;
export type FormValidationMode = 'onSubmit' | 'onBlur' | 'onChange';
const EMPTY_ERRORS: Errors = {};

type FormRef = {
  fields: Record<
    string,
    {
      name: string | undefined;
      validate: () => void;
      validityData: FieldValidityData;
      controlRef: MaybeAccessor<HTMLElement>;
      getValueRef: (() => unknown) | undefined;
    }
  >;
};

export type RegisteredFormField = FormRef['fields'][string];

export interface FormContext {
  errors: Accessor<Errors>;
  clearErrors: (name: string | undefined) => void;
  formRef: Store<FormRef>;
  setFormRef: StoreSetter<FormRef>;
  validationMode: Accessor<FormValidationMode>;
  submitAttempted: Accessor<boolean>;
}

const DEFAULT_FORM_CONTEXT = {
  formRef: {
    fields: {},
  },
  setFormRef: NOOP,
  errors: () => EMPTY_ERRORS,
  clearErrors: NOOP,
  validationMode: () => 'onSubmit' as const,
  submitAttempted: () => false,
} satisfies FormContext;

export const FormContext = createContext<FormContext>(DEFAULT_FORM_CONTEXT);

export function useFormContext() {
  const context = useContext(FormContext);

  if (!context) {
    throw new Error('Base UI: FormContext is missing. Form parts must be placed within <Form>.');
  }

  return context;
}
