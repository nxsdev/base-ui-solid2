import { createRenderer, describeConformance } from '#test-utils';
import { Fieldset } from '@base-ui/solid2/fieldset';

describe('<Fieldset.Root />', () => {
  const { render } = createRenderer();

  describeConformance(Fieldset.Root, () => ({
    inheritComponent: 'fieldset',
    refInstanceof: window.HTMLFieldSetElement,
    render,
  }));
});
