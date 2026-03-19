import { type Accessor, type JSX } from 'solid-js';
import { type MaybeAccessor } from '../solid-helpers';
import { useId } from './useId';

/**
 * Wraps `useId` and prefixes generated `id`s with `base-ui-`
 * @param {string | undefined} idOverride overrides the generated id when provided
 * @returns {string | undefined}
 */
export function useBaseUiId(
  idOverride?: MaybeAccessor<string | JSX.RemoveAttribute | undefined>,
): Accessor<string> {
  const id = useId(idOverride, 'base-ui');
  return id;
}
