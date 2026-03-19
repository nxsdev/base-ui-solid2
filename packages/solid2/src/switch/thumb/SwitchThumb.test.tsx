import { createRenderer, describeConformance } from '#test-utils';
import { Switch } from '@base-ui/solid2/switch';
import { SwitchRootContext } from '../root/SwitchRootContext';

const testContext: SwitchRootContext = {
  checked: () => false,
  disabled: () => false,
  readonly: () => false,
  required: () => false,
  dirty: () => false,
  touched: () => false,
  filled: () => false,
  focused: () => false,
  valid: () => null,
};

describe('<Switch.Thumb />', () => {
  const { render } = createRenderer();

  describeConformance(Switch.Thumb, () => ({
    refInstanceof: window.HTMLSpanElement,
    render: (node, props) => {
      return render(() => (
        <SwitchRootContext value={testContext}>{node(props)}</SwitchRootContext>
      ));
    },
  }));
});
