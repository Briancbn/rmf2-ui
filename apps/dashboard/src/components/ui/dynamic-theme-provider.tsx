'use client';

import type { ReactNode } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { ThemeSwitcher, useThemeSwitcherActiveTheme } from '@rmf2-ui/chakra';
import { ColorModeProvider, useColorMode } from './color-mode';
import type { ColorModeProviderProps } from './color-mode';

function SystemProvider({ children }: { children: ReactNode }) {
  const theme = useThemeSwitcherActiveTheme();
  return <ChakraProvider value={theme.system}>{children}</ChakraProvider>;
}

interface ThemeSwitcherBridgeProps {
  themes?: ThemeSwitcher.ThemeConfig[];
  defaultTheme?: string;
  children: ReactNode;
}

function ThemeSwitcherBridge({
  themes,
  defaultTheme,
  children,
}: ThemeSwitcherBridgeProps) {
  const { colorMode, setColorMode } = useColorMode();
  return (
    <ThemeSwitcher.Root
      themes={themes}
      defaultTheme={defaultTheme}
      colorMode={colorMode}
      setColorMode={setColorMode}
    >
      <SystemProvider>{children}</SystemProvider>
    </ThemeSwitcher.Root>
  );
}

export interface DynamicThemeProviderProps
  extends Omit<ColorModeProviderProps, 'themes' | 'defaultTheme'> {
  themes?: ThemeSwitcher.ThemeConfig[];
  defaultTheme?: string;
}

export function DynamicThemeProvider({
  themes,
  defaultTheme,
  children,
  ...props
}: DynamicThemeProviderProps) {
  return (
    <ColorModeProvider disableTransitionOnChange={false} {...props}>
      <ThemeSwitcherBridge themes={themes} defaultTheme={defaultTheme}>
        {children}
      </ThemeSwitcherBridge>
    </ColorModeProvider>
  );
}
