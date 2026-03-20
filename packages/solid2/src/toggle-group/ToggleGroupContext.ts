import { createContext, useContext, type Accessor } from 'solid-js';
import type { Orientation } from '../utils/types';

export interface ToggleGroupContext {
  value: Accessor<readonly any[]>;
  setGroupValue: (newValue: string, nextPressed: boolean, event: Event) => void;
  disabled: Accessor<boolean>;
  orientation: Accessor<Orientation>;
}

export const ToggleGroupContext = createContext<ToggleGroupContext | null>(null);

export function useToggleGroupContext(optional = true) {
  const context = useContext(ToggleGroupContext);
  if (context == null && !optional) {
    throw new Error(
      'Base UI: ToggleGroupContext is missing. ToggleGroup parts must be placed within <ToggleGroup>.',
    );
  }

  return context ?? undefined;
}
