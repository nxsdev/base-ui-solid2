import { createSignal, createTrackedEffect } from 'solid-js';
import { access, type MaybeAccessor } from '../solid-helpers';
import { InteractionType, useEnhancedClickHandler } from './useEnhancedClickHandler';

/**
 * Determines the interaction type (keyboard, mouse, touch, etc.) that opened the component.
 *
 * @param open The open state of the component.
 */
export function useOpenInteractionType(open: MaybeAccessor<boolean>) {
  const [openMethod, setOpenMethod] = createSignal<InteractionType | null>(null);
  const openProp = () => access(open);

  createTrackedEffect(() => {
    if (!openProp() && openMethod() !== null) {
      setOpenMethod(null);
    }
  });

  const handleTriggerClick = (_: MouseEvent, interactionType: InteractionType) => {
    if (!openProp()) {
      setOpenMethod(interactionType);
    }
  };

  const { onClick, onPointerDown } = useEnhancedClickHandler(handleTriggerClick);

  return {
    openMethod,
    triggerProps: {
      onClick,
      onPointerDown,
    },
  };
}
