import { Tooltip } from '@base-ui/solid2/tooltip';
import { PackageManagerSnippetProvider } from 'docs-solid2/src/blocks/PackageManagerSnippet/PackageManagerSnippetProvider';
import { DemoVariantSelectorProvider } from 'docs-solid2/src/components/Demo/DemoVariantSelectorProvider';
import type { ParentProps } from 'solid-js';

export function DocsProviders(props: ParentProps) {
  return (
    <Tooltip.Provider delay={350}>
      <DemoVariantSelectorProvider defaultVariant="css-modules" defaultLanguage="ts">
        <PackageManagerSnippetProvider defaultValue="npm">
          {props.children}
        </PackageManagerSnippetProvider>
      </DemoVariantSelectorProvider>
    </Tooltip.Provider>
  );
}
