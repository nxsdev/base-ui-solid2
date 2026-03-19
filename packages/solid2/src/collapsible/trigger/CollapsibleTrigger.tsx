import { type JSX } from 'solid-js';
import { splitComponentProps } from '../../solid-helpers';
import { useButton } from '../../use-button';
import { triggerOpenStateMapping } from '../../utils/collapsibleOpenStateMapping';
import type { CustomStyleHookMapping } from '../../utils/getStyleHookProps';
import { transitionStatusMapping } from '../../utils/styleHookMapping';
import type { BaseUIComponentProps } from '../../utils/types';
import { useRenderElement } from '../../utils/useRenderElement';
import { CollapsibleRoot } from '../root/CollapsibleRoot';
import { useCollapsibleRootContext } from '../root/CollapsibleRootContext';

const styleHookMapping: CustomStyleHookMapping<CollapsibleRoot.State> = {
  ...triggerOpenStateMapping,
  ...transitionStatusMapping,
};

/**
 * A button that opens and closes the collapsible panel.
 * Renders a `<button>` element.
 *
 * Documentation: [Base UI Collapsible](https://base-ui.com/react/components/collapsible)
 */
export function CollapsibleTrigger(componentProps: CollapsibleTrigger.Props): JSX.Element {
  const [, local, elementProps] = splitComponentProps(componentProps, [
    'disabled',
    'id',
    'nativeButton',
  ]);
  const {
    panelId,
    open,
    handleTrigger,
    disabled: contextDisabled,
    state,
  } = useCollapsibleRootContext();
  const nativeButton = () => local.nativeButton ?? true;
  const disabled = () => local.disabled === true || local.disabled === '' || contextDisabled();

  const button = useButton({
    disabled,
    focusableWhenDisabled: true,
    native: nativeButton,
  });

  const props: JSX.ButtonHTMLAttributes<HTMLButtonElement> = {
    get 'aria-controls'() {
      return open() ? panelId() : undefined;
    },
    get 'aria-expanded'() {
      return open() ? 'true' : 'false';
    },
    get disabled() {
      return disabled() ? true : undefined;
    },
    onClick: handleTrigger,
  };

  const element = useRenderElement('button', componentProps, {
    state,
    ref: button.buttonRef,
    props: [props, elementProps, button.getButtonProps],
    customStyleHookMapping: styleHookMapping,
  });

  return <>{element()}</>;
}

export namespace CollapsibleTrigger {
  export interface Props extends BaseUIComponentProps<'button', CollapsibleRoot.State> {
    /**
     * Whether the component renders a native `<button>` element when replacing it
     * via the `render` prop.
     * Set to `false` if the rendered element is not a button (e.g. `<div>`).
     * @default true
     */
    nativeButton?: boolean;
  }
}
