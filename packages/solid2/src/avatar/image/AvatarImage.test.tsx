import { createRenderer, describeConformance } from '#test-utils';
import { Avatar } from '@base-ui/solid2/avatar';

describe('<Avatar.Image />', () => {
  const { render } = createRenderer();
  vi.mock('./useImageLoadingStatus', () => ({
    useImageLoadingStatus: () => () => 'loaded',
  }));

  describeConformance(Avatar.Image, () => ({
    render: (node, props) => render(() => <Avatar.Root>{node(props)}</Avatar.Root>),
    refInstanceof: window.HTMLImageElement,
  }));
});
