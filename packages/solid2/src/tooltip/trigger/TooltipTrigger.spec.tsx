import { Tooltip } from '@base-ui/solid2/tooltip';

// `props: any` will error
<Tooltip.Trigger render={{ component: 'button', type: 'button' }} />;
<Tooltip.Trigger render="input" />;
