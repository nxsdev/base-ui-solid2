import { createContext, useContext, type Accessor } from 'solid-js';
import type { StoreSetter, Store } from 'solid-js';
import type { CodependentRefs } from '../../solid-helpers';
import type { ToastObject } from '../useToastManager';

export interface ToastRootContext {
  toast: Accessor<ToastObject<any>>;
  refs: {
    rootRef: HTMLElement | null | undefined;
  };
  titleId: Accessor<string | undefined>;
  descriptionId: Accessor<string | undefined>;
  swipeDirection: Accessor<'up' | 'down' | 'left' | 'right' | undefined>;
  renderScreenReaderContent: Accessor<boolean>;
  swiping: Accessor<boolean>;
  codependentRefs: Store<CodependentRefs<['title', 'description']>>;
  setCodependentRefs: StoreSetter<CodependentRefs<['title', 'description']>>;
}

export const ToastRootContext = createContext<ToastRootContext | undefined>(undefined);

export function useToastRootContext(): ToastRootContext {
  const context = useContext(ToastRootContext);
  if (!context) {
    throw new Error(
      'Base UI: ToastRootContext is missing. Toast parts must be used within <Toast.Root>.',
    );
  }
  return context;
}
