import { createRenderer, describeConformance } from '#test-utils';
import { NavigationMenu } from '@base-ui/solid2/navigation-menu';

describe('<NavigationMenu.Item />', () => {
  const { render } = createRenderer();

  describeConformance(NavigationMenu.Item, () => ({
    render: (node, props) => render(() => <NavigationMenu.Root>{node(props)}</NavigationMenu.Root>),
    refInstanceof: window.HTMLDivElement,
  }));
});
