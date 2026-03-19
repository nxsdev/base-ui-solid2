import { createRenderer, describeConformance } from '#test-utils';
import { Avatar } from '@base-ui/solid2/avatar';

describe('<Avatar.Root />', () => {
  const { render } = createRenderer();

  describeConformance(Avatar.Root, () => ({
    render,
    refInstanceof: window.HTMLSpanElement,
  }));
});
