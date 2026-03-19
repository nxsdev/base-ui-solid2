import { Switch } from '@base-ui/solid2/switch';
import styles from './index.module.css';

export default function ExampleSwitch() {
  return (
    <Switch.Root defaultChecked class={styles.Switch}>
      <Switch.Thumb class={styles.Thumb} />
    </Switch.Root>
  );
}
