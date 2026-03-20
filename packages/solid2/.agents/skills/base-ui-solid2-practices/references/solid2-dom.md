# Solid 2 DOM Rules

Primary source: the official Solid 2 RFC on DOM behavior.

Use this file when editing JSX props, built-in DOM attributes, `class`, refs, or directives.

## Core rules

- Solid 2 follows HTML standards by default: attributes over properties for built-ins.
- Built-in DOM attribute names are lowercase.
- Boolean literals add or remove the attribute.
- `classList` is folded into `class`; `class` accepts strings, arrays, and objects.
- `use:` directives are removed. Use `ref={directive(...)}` or `ref={[a, b]}`.

## Migration checks

- Lowercase built-in DOM attributes at the DOM boundary.
- Keep event handlers camelCase.
- For attributes that truly require the string `"true"`, pass a string rather than a boolean.
- When code is not directly at the JSX/DOM boundary, keep domain types clean and do not let DOM-specific sentinels leak inward.

## Repo-specific guidance for packages/solid2

- Public Base UI component props stay React-compatible unless upstream React behavior changed. Do not rename public props to lowercase DOM spellings.
- Lowercasing is an implementation concern for emitted DOM props, not a license to change the outward API contract.
