'use client';

import { type ReactNode } from 'react';
import { ChakraProvider, type SystemContext } from '@chakra-ui/react';
import { ThemeSwitcher, useThemeSwitcher } from '@rmf2-ui/chakra';
import { ColorModeProvider, type ColorModeProviderProps } from './color-mode';

function ChakraFromTheme({ children }: { children: ReactNode }) {
  const { activeSystem } = useThemeSwitcher()!;
  return <ChakraProvider value={activeSystem}>{children}</ChakraProvider>;
}

export interface ProviderProps extends ColorModeProviderProps {
  themes: Record<string, SystemContext>;
  defaultTheme?: string;
}

export function Provider({ themes, defaultTheme, ...props }: ProviderProps) {
  return (
    <ThemeSwitcher.Root themes={themes} defaultTheme={defaultTheme}>
      <ChakraFromTheme>
        <ColorModeProvider {...props} />
      </ChakraFromTheme>
    </ThemeSwitcher.Root>
  );
}
