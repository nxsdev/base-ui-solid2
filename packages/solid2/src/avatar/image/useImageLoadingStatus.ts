import { createEffect, createSignal, onCleanup, type Accessor, type JSX } from 'solid-js';
import { access, type MaybeAccessor } from '../../solid-helpers';

export type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface UseImageLoadingStatusOptions {
  src: MaybeAccessor<string | undefined>;
  referrerpolicy?: MaybeAccessor<JSX.HTMLReferrerPolicy | undefined>;
  crossorigin?: MaybeAccessor<JSX.ImgHTMLAttributes<HTMLImageElement>['crossorigin'] | undefined>;
}

export function useImageLoadingStatus(
  options: UseImageLoadingStatusOptions,
): Accessor<ImageLoadingStatus> {
  const [loadingStatus, setLoadingStatus] = createSignal<ImageLoadingStatus>('idle');
  const src = () => access(options.src);
  const referrerpolicy = () => access(options.referrerpolicy);
  const crossorigin = () => access(options.crossorigin);

  createEffect(() => {
    if (!src()) {
      setLoadingStatus('error');
      return;
    }

    let isMounted = true;
    const image = new window.Image();

    const updateStatus = (status: ImageLoadingStatus) => () => {
      if (!isMounted) {
        return;
      }

      setLoadingStatus(status);
    };

    setLoadingStatus('loading');
    image.onload = updateStatus('loaded');
    image.onerror = updateStatus('error');
    if (referrerpolicy()) {
      image.referrerpolicy = referrerpolicy()!;
    }
    image.crossorigin = crossorigin() ?? null;
    image.src = src()!;

    onCleanup(() => {
      isMounted = false;
    });
  });

  return loadingStatus;
}
