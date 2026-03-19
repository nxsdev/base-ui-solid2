import { createTrackedEffect, createSignal } from 'solid-js';
import { access, type MaybeAccessor } from '../solid-helpers';
import { AnimationFrame } from './useAnimationFrame';

export type TransitionStatus = 'starting' | 'ending' | 'idle' | undefined;

/**
 * Provides a status string for CSS animations.
 * @param open - an accessor to a boolean that determines if the element is open.
 * @param enableIdleState - a boolean that enables the `'idle'` state between `'starting'` and `'ending'`
 */
export function useTransitionStatus(
  open: MaybeAccessor<boolean>,
  enableIdleState: MaybeAccessor<boolean> = false,
  deferEndingState: MaybeAccessor<boolean> = false,
) {
  const openProp = () => access(open);
  const enableIdleStateProp = () => access(enableIdleState) ?? false;
  const deferEndingStateProp = () => access(deferEndingState) ?? false;
  const [mounted, setMounted] = createSignal(openProp());
  const [transitionStatus, setTransitionStatus] = createSignal<TransitionStatus>(
    openProp() && enableIdleStateProp() ? 'idle' : undefined,
  );

  function updateState(newMounted: boolean) {
    const previousMounted = mounted();
    const currentTransitionStatus = transitionStatus();

    setMounted(newMounted);

    if (openProp() && !newMounted) {
      setMounted(true);
      setTransitionStatus('starting');
      return;
    }

    if (!openProp() && newMounted && currentTransitionStatus !== 'ending' && !deferEndingStateProp()) {
      setTransitionStatus('ending');
      return;
    }

    if (!openProp() && !newMounted && currentTransitionStatus === 'ending') {
      setTransitionStatus(undefined);
      return;
    }

    if (previousMounted && !newMounted && !openProp() && currentTransitionStatus !== 'ending') {
      setTransitionStatus('ending');
      return;
    }

    if (newMounted === false && previousMounted && !openProp() && currentTransitionStatus === 'ending') {
      setMounted(false);
      setTransitionStatus(undefined);
    }
  }

  createTrackedEffect(() => {
    openProp();
    enableIdleStateProp();
    deferEndingStateProp();
    transitionStatus();
    updateState(mounted());
  });

  createTrackedEffect(() => {
    if (!openProp() && mounted() && transitionStatus() !== 'ending' && deferEndingStateProp()) {
      const frame = AnimationFrame.request(() => setTransitionStatus('ending'));
      return () => AnimationFrame.cancel(frame);
    }
  });

  createTrackedEffect(() => {
    if (!openProp()) {
      return;
    }

    if (mounted() && enableIdleStateProp() && transitionStatus() !== 'idle') {
      setTransitionStatus('starting');
    }

    const frame = AnimationFrame.request(() =>
      setTransitionStatus(enableIdleStateProp() ? 'idle' : undefined),
    );
    return () => AnimationFrame.cancel(frame);
  });

  return {
    mounted,
    transitionStatus,
    setMounted: updateState,
  };
}
