import { type Accessor, createContext, type Setter, useContext } from 'solid-js';

export interface SelectGroupContext {
  labelId: Accessor<string | undefined>;
  setLabelId: Setter<string | undefined>;
}

export const SelectGroupContext = createContext<SelectGroupContext | null>(null);

export function useSelectGroupContext() {
  const context = useContext(SelectGroupContext);
  if (!context) {
    throw new Error(
      'Base UI: SelectGroupContext is missing. SelectGroup parts must be placed within <Select.Group>.',
    );
  }
  return context;
}
