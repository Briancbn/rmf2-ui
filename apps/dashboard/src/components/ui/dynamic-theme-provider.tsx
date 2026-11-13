'use client';

import type { ReactNode } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import type { SystemContext } from '@chakra-ui/react';
import { ThemeSwitcher, useThemeSwitcher } from '@rmf2-ui/chakra';
import { ColorModeProvider, useColorMode } from './color-mode';
import type { ColorModeProviderProps } from './color-mode';

function SystemProvider({ children }: { children: ReactNode }) {
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
      <SystemProvider>{children}</SystemProvider>
    </ThemeSwitcher.Root>
  );
}

export interface DynamicThemeProviderProps extends ColorModeProviderProps {
  systems: Record<string, SystemContext>;
  defaultTheme?: string;
  themeColors?: Record<string, ThemeSwitcher.ThemeColorPreview>;
}

export function DynamicThemeProvider({
  systems,
  defaultTheme,
  themeColors,
  children,
  ...props
}: DynamicThemeProviderProps) {
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
