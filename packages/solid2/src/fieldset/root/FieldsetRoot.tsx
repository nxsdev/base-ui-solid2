import { createEffect, createSignal } from 'solid-js';
import { createStore } from 'solid-js';
import { splitComponentProps, type CodependentRefs } from '../../solid-helpers';
import type { BaseUIComponentProps } from '../../utils/types';
import { useRenderElement } from '../../utils/useRenderElement';
import { FieldsetRootContext } from './FieldsetRootContext';

/**
 * Groups the fieldset legend and the associated fields.
 * Renders a `<fieldset>` element.
 *
 * Documentation: [Base UI Fieldset](https://base-ui.com/react/components/fieldset)
 */
export function FieldsetRoot(componentProps: FieldsetRoot.Props) {
  const [, local, elementProps] = splitComponentProps(componentProps, ['disabled']);
  const disabled = () => local.disabled === true || local.disabled === '';

  const [legendId, setLegendId] = createSignal<string | undefined>();
  const [codependentRefs, setCodependentRefs] = createStore<CodependentRefs<['legend']>>({});

  const state: FieldsetRoot.State = {
    get disabled() {
      return disabled();
    },
  };

  const contextValue: FieldsetRootContext = {
    legendId,
    codependentRefs,
    setCodependentRefs,
    disabled,
  };

  createEffect(
    () => codependentRefs.legend,
    (legend) => {
      setLegendId(legend ? (legend.id() ?? legend.explicitId()) : undefined);
    },
  );

  const element = useRenderElement('fieldset', componentProps, {
    state,
    props: [
      {
        get 'aria-labelledby'() {
          return legendId();
        },
      },
      elementProps,
    ],
  });

  return (
    <FieldsetRootContext value={contextValue}>{element()}</FieldsetRootContext>
  );
}

export namespace FieldsetRoot {
  export type State = {
    /**
     * Whether the component should ignore user interaction.
     */
    disabled: boolean;
  };

  export interface Props extends BaseUIComponentProps<'fieldset', State> {}
}
