import { untrack } from 'solid-js';
import { access, type MaybeAccessor } from '../solid-helpers';

export type CustomStyleHookMapping<State> = {
  [Property in keyof State]?: (
    state: State[Property],
  ) => Record<string, MaybeAccessor<string>> | null;
};

export function getStyleHookProps<State extends Record<string, MaybeAccessor<any>>>(
  state: State,
  customMapping?: CustomStyleHookMapping<State>,
) {
  const hasOwn = Object.prototype.hasOwnProperty;

  const resolveForKey = (property: string) => {
    /* eslint-disable-next-line guard-for-in */
    for (const key in state) {
      const value = access(state[key]);
      const resolvedValue = access(value);

      if (customMapping && hasOwn.call(customMapping, key)) {
        const customProps = customMapping[key]!(resolvedValue);
        if (customProps != null && property in customProps) {
          return access(customProps[property]);
        }

        continue;
      }

      if (property === `data-${key.toLowerCase()}`) {
        if (resolvedValue === true) {
          return '';
        }
        if (resolvedValue) {
          return resolvedValue.toString();
        }
        return undefined;
      }
    }

    return undefined;
  };

  const collectKeys = () => {
    const keys = new Set<string>();

    /* eslint-disable-next-line guard-for-in */
    for (const key in state) {
      const resolvedValue = untrack(() => {
        const value = access(state[key]);
        return access(value);
      });

      if (customMapping && hasOwn.call(customMapping, key)) {
        const customProps = untrack(() => customMapping[key]!(resolvedValue));
        if (customProps != null) {
          Object.keys(customProps).forEach((customKey) => keys.add(customKey));
        }
        continue;
      }

      if (resolvedValue) {
        keys.add(`data-${key.toLowerCase()}`);
      }
    }

    return Array.from(keys);
  };

  return new Proxy<Record<string, string>>(
    {},
    {
      get(_, property) {
        if (typeof property !== 'string') {
          return undefined;
        }
        return resolveForKey(property);
      },
      has(_, property) {
        return typeof property === 'string' && resolveForKey(property) !== undefined;
      },
      ownKeys() {
        return collectKeys();
      },
      getOwnPropertyDescriptor(_, property) {
        if (typeof property !== 'string') {
          return undefined;
        }

        if (!collectKeys().includes(property)) {
          return undefined;
        }

        return {
          configurable: true,
          enumerable: true,
          get() {
            return resolveForKey(property);
          },
        };
      },
    },
  );
}
