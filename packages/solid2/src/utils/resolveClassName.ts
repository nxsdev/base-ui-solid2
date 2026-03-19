/**
 * If the provided className is a string, it will be returned as is.
 * Otherwise, the function will call the className function with the state as the first argument.
 *
 * @param className
 * @param state
 */
export function resolveClassName<State>(
  className:
    | Exclude<import('solid-js').JSX.HTMLAttributes<any>['class'], undefined>
    | ((state: State) => Exclude<import('solid-js').JSX.HTMLAttributes<any>['class'], undefined>)
    | undefined,
  state: State | undefined,
) {
  return typeof className === 'function' ? className(state ?? ({} as State)) : className;
}
