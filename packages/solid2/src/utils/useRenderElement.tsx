import { Show, type JSX, type ValidComponent } from 'solid-js';
import { Dynamic, type DynamicProps } from '@solidjs/web';
import { mergeProps } from '../merge-props/mergeProps';
import { access, type MaybeAccessor } from '../solid-helpers';
import { EMPTY_OBJECT } from './constants';
import { CustomStyleHookMapping, getStyleHookProps } from './getStyleHookProps';
import { resolveClassName } from './resolveClassName';
import type { BaseUIComponentProps, ComponentRenderFn, HTMLProps } from './types';

export function useRenderElement<
  State extends Record<string, MaybeAccessor<any>>,
  RenderedElementType extends Element,
  TagName extends keyof JSX.IntrinsicElements | undefined,
  Enabled extends boolean | undefined = undefined,
  RenderFnElement extends ValidComponent = ValidComponent,
>(
  element: MaybeAccessor<TagName>,
  componentProps: RenderElement.ComponentProps<State, RenderedElementType, RenderFnElement>,
  params: RenderElement.Parameters<State, RenderedElementType, TagName, Enabled>,
): (props?: HTMLProps) => Enabled extends false ? null : JSX.Element {
  type DynamicRenderProps = Omit<DynamicProps<ValidComponent>, 'component'>;

  const renderDynamic = (
    component: ValidComponent,
    props: DynamicRenderProps,
  ) => {
    return <Dynamic component={component} {...props} />;
  };

  const Component = (props: HTMLProps) => {
    const renderProps =
      componentProps.render &&
      typeof componentProps.render === 'object' &&
      'component' in componentProps.render
        ? componentProps.render
        : undefined;

    const mergedProps = mergeProps([
      props,

      {
        ref: (el: any) => {
          if (typeof componentProps.ref === 'function') {
            componentProps.ref(el);
          } else {
            componentProps.ref = el;
          }

          if (typeof params.ref === 'function') {
            params.ref(el);
          } else {
            params.ref = el;
          }
        },
      },

      renderProps
        ? ({
            ...renderProps,
            component: undefined,
          } as object)
        : undefined,

      params.disableStyleHooks !== true
        ? getStyleHookProps(params.state ?? EMPTY_OBJECT, params.customStyleHookMapping)
        : undefined,

      mergeProps(params.props),

      {
        get class() {
          return resolveClassName(componentProps.class, params.state);
        },
      },
    ]);

    const renderPropsWithChildren = () => {
      const children = params.children ?? componentProps.children;
      if (children === undefined) {
        return mergedProps;
      }

      return mergeProps([
        mergedProps,
        {
          get children() {
            return children;
          },
        },
      ]);
    };

    return (
      <Show when={access(params.enabled) ?? true}>
        {(() => {
          if (typeof componentProps.render === 'function') {
            return componentProps.render(
              renderPropsWithChildren(),
              params.state ?? (EMPTY_OBJECT as State),
            );
          }

          if (renderProps) {
            return renderDynamic(
              renderProps.component as ValidComponent,
              renderPropsWithChildren() as DynamicRenderProps,
            );
          }

          const resolvedElement =
            typeof componentProps.render === 'string' ? componentProps.render : access(element);

          return (
            <Dynamic
              component={resolvedElement}
              {...(resolvedElement === 'button' ? { type: 'button' } : {})}
              {...(resolvedElement === 'img' ? { alt: '' } : {})}
              {...renderPropsWithChildren()}
            />
          );
        })()}
      </Show>
    );
  };

  return ((renderFnProps: HTMLProps = {}) => {
    return <Component {...renderFnProps} />;
  }) as (props?: HTMLProps) => Enabled extends false ? null : JSX.Element;
}

export namespace RenderElement {
  export type Parameters<
    State extends Record<string, MaybeAccessor<any>>,
    RenderedElementType extends Element,
    TagName extends keyof JSX.IntrinsicElements | undefined,
    Enabled extends boolean | undefined,
  > = {
    /**
     * If `false`, the hook will skip most of its internal logic and return `null`.
     * This is useful for rendering a component conditionally.
     * @default true
     */
    enabled?: MaybeAccessor<Enabled>;
    /**
     * @deprecated
     */
    propGetter?: (externalProps: HTMLProps) => HTMLProps;
    /**
     * The ref to apply to the rendered element.
     */
    ref?: JSX.Ref<RenderedElementType>;
    /**
     * The state of the component.
     */
    state?: State;
    /**
     * Intrinsic props to be spread on the rendered element.
     */
    props?:
      | BaseUIComponentProps<TagName, State>
      | Array<
          | BaseUIComponentProps<TagName, State>
          | undefined
          | ((
              props: BaseUIComponentProps<TagName, State>,
            ) => BaseUIComponentProps<TagName, State> | undefined | null)
        >;

    /**
     * A mapping of state to style hooks.
     */
    customStyleHookMapping?: CustomStyleHookMapping<State>;
    /**
     * The children override to render.
     */
    children?: JSX.Element | ((...args: any[]) => JSX.Element);
  } /* This typing ensures `disableStyleHookMapping` is constantly defined or undefined */ & (
    | {
        /**
         * Disable style hook mapping.
         */
        disableStyleHooks: true;
      }
    | {
        /**
         * Disable style hook mapping.
         */
        disableStyleHooks?: false;
      }
  );

  export interface ComponentProps<
    State extends Record<string, MaybeAccessor<any>>,
    RenderedElementType extends Element,
    RenderFnElement extends ValidComponent = ValidComponent,
  > {
    /**
     * The class name to apply to the rendered element.
     * Can be a string or a function that accepts the state and returns a string.
     */
    class?:
      | Exclude<JSX.HTMLAttributes<any>['class'], undefined>
      | ((state: State) => Exclude<JSX.HTMLAttributes<any>['class'], undefined>);
    /**
     * The render prop or Solid element to override the default element.
     */
    render?:
      | keyof JSX.IntrinsicElements
      | DynamicProps<RenderFnElement>
      | ComponentRenderFn<Record<string, unknown>, State>
      | null
      | undefined;
    /**
     * The children to render.
     */
    children?: JSX.Element | ((...args: any[]) => JSX.Element);
    /**
     * The ref to apply to the rendered element.
     */
    ref?: JSX.Ref<RenderedElementType>;
  }
}
