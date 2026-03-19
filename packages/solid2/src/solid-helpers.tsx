import { children, onSettled, type Accessor, type JSX } from 'solid-js';

export function callEventHandler<T, E extends Event>(
  eventHandler: JSX.EventHandlerUnion<T, E> | undefined,
  event: E & { currentTarget?: T; target?: Element },
) {
  if (eventHandler) {
    if (typeof eventHandler === 'function') {
      eventHandler(event);
    } else {
      eventHandler[0](eventHandler[1], event);
    }
  }

  return event.defaultPrevented;
}

export type Accessify<T, AccessorKeys extends keyof T> = {
  [K in keyof T]: K extends AccessorKeys ? Accessor<T[K]> : T[K];
};

// https://github.com/solidjs-community/solid-primitives/blob/461ab9edda2ffa6666d7ed2d5deed8b6b77f65a6/packages/utils/src/types.ts#L29
export type MaybeAccessor<T> = T | Accessor<T>;

// https://github.com/solidjs-community/solid-primitives/blob/461ab9edda2ffa6666d7ed2d5deed8b6b77f65a6/packages/utils/src/types.ts#L42C1-L44C7
export type MaybeAccessorValue<T extends MaybeAccessor<any>> = T extends () => any
  ? ReturnType<T>
  : T;

export function autofocus(element: HTMLElement, autofocusProp: Accessor<boolean>) {
  if (autofocusProp?.() === false) {
    return;
  }

  onSettled(() => {
    if (element.hasAttribute('autofocus')) {
      queueMicrotask(() => element.focus());
    }
  });
}

// https://github.com/solidjs-community/solid-primitives/blob/461ab9edda2ffa6666d7ed2d5deed8b6b77f65a6/packages/utils/src/index.ts#L106C1-L107C59
export function access<T>(v: MaybeAccessor<T>): T {
  return typeof v === 'function' && !v.length ? (v as Accessor<T>)() : (v as T);
}

export type Args<T extends ((...args: any[]) => any) | undefined | null> = Parameters<
  Exclude<T, undefined | null>
>;

function pickProps<T extends Record<PropertyKey, any>, K extends readonly (keyof T)[]>(
  props: T,
  keys: K,
): Pick<T, K[number]> {
  const picked = {} as Pick<T, K[number]>;

  for (const key of keys) {
    Object.defineProperty(picked, key, {
      enumerable: true,
      configurable: true,
      get: () => props[key],
    });
  }

  return picked;
}

function omitProps<T extends Record<PropertyKey, any>, K extends readonly (keyof T)[]>(
  props: T,
  keys: K,
): Omit<T, K[number]> {
  const blocked = new Set<PropertyKey>(keys as readonly PropertyKey[]);
  const omitted = {} as Omit<T, K[number]>;

  for (const key of Reflect.ownKeys(props)) {
    if (blocked.has(key)) {
      continue;
    }

    Object.defineProperty(omitted, key, {
      enumerable: true,
      configurable: true,
      get: () => props[key as keyof T],
    });
  }

  return omitted;
}

export function splitComponentProps<
  T extends Record<any, any>,
  K extends [readonly (keyof T)[], ...(readonly (keyof T)[])[]],
>(props: T, ...keys: K) {
  const componentKeys = ['class', 'render'] as const satisfies readonly (keyof T)[];
  const componentProps = pickProps(props, componentKeys);
  const allKeys = [...componentKeys, ...keys.flat()] as (keyof T)[];
  const rest = omitProps(props, allKeys);
  const others = keys.map((groupKeys) => pickProps(props, groupKeys));

  return [componentProps, ...others, rest] as unknown as [
    Pick<T, 'class' | 'render'>,
    ...{
      [I in keyof K]: Pick<T, K[I][number]>;
    },
    Omit<T, 'class' | 'render' | K[number][number]>,
  ];
}

export type CodependentRefs<T extends string[]> = {
  [K in T[number]]?: {
    ref: Accessor<HTMLElement | null | undefined>;
    id: Accessor<string | undefined>;
    explicitId: Accessor<string | undefined>;
  };
};

export function normalizeOptionalId(value: string | JSX.RemoveAttribute | undefined) {
  return typeof value === 'string' ? value : undefined;
}

// https://github.com/solidjs/solid/issues/2478#issuecomment-2888503241
export function childrenLazy(resolver: () => JSX.Element) {
  const _s = Symbol();
  let x: any = _s;
  return () => {
    if (x === _s) {
      x = children(resolver);
    }
    return x;
  };
}
