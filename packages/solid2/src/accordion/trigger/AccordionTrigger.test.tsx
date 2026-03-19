import { createRenderer, describeConformance } from '#test-utils';
import { Accordion } from '@base-ui/solid2/accordion';

describe('<Accordion.Trigger />', () => {
  const { render } = createRenderer();

  describeConformance(Accordion.Trigger, () => ({
    render: (node, props) =>
      render(() => (
        <Accordion.Root>
          <Accordion.Item>{node(props)}</Accordion.Item>
        </Accordion.Root>
      )),
    refInstanceof: window.HTMLButtonElement,
  }));
});
