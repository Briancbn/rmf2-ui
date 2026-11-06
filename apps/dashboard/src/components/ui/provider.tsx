'use client';

import { type ReactNode } from 'react';
import { ChakraProvider, type SystemContext } from '@chakra-ui/react';
import {
  ThemeSwitcher,
  useThemeSwitcher,
  type ThemeColorPreview,
} from '@rmf2-ui/chakra';
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
  themeColors?: Record<string, ThemeColorPreview>;
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
  themeColors?: Record<string, ThemeColorPreview>;
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
