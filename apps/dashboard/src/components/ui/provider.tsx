'use client';

import type { ReactNode } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import type { SystemContext } from '@chakra-ui/react';
import { ThemeSwitcher, useThemeSwitcher } from '@rmf2-ui/chakra';
import {
  ColorModeProvider,
  useColorMode,
  type ColorModeProviderProps,
} from './color-mode';

function ChakraFromTheme({ children }: { children: ReactNode }) {
  const { activeSystem } = useThemeSwitcher()!;
  return <ChakraProvider value={activeSystem}>{children}</ChakraProvider>;
}

interface ThemeSwitcherBridgeProps {
  systems: Record<string, SystemContext>;
  defaultTheme?: string;
  themeColors?: Record<string, ThemeSwitcher.ThemeColorPreview>;
  children: ReactNode;
}

function ThemeSwitcherBridge({
  systems,
  defaultTheme,
  themeColors,
  children,
}: ThemeSwitcherBridgeProps) {
  const { colorMode, setColorMode } = useColorMode();
  return (
    <ThemeSwitcher.Root
      themes={systems}
      defaultTheme={defaultTheme}
      themeColors={themeColors}
      colorMode={colorMode}
      setColorMode={setColorMode}
    >
      <ChakraFromTheme>{children}</ChakraFromTheme>
    </ThemeSwitcher.Root>
  );
}

export interface ProviderProps extends ColorModeProviderProps {
  systems: Record<string, SystemContext>;
  defaultTheme?: string;
  themeColors?: Record<string, ThemeSwitcher.ThemeColorPreview>;
}

export function Provider({
  systems,
  defaultTheme,
  themeColors,
  children,
  ...props
}: ProviderProps) {
  return (
    <ColorModeProvider disableTransitionOnChange={false} {...props}>
      <ThemeSwitcherBridge
        systems={systems}
        defaultTheme={defaultTheme}
        themeColors={themeColors}
      >
        {children}
      </ThemeSwitcherBridge>
    </ColorModeProvider>
  );
}
