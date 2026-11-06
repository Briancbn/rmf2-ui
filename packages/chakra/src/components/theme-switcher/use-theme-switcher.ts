import { createContext, useContext } from 'react';
import type { SystemContext } from '@chakra-ui/react';

export type ThemeSwitcherColorMode = 'light' | 'dark';

export interface ThemeSwitcherThemeColorPreview {
  brand: string;
  bg: string;
  darkBg: string;
}

export interface ThemeSwitcherContextValue {
  themeId: string;
  availableThemes: string[];
  activeSystem: SystemContext;
  themeColors: Record<string, ThemeSwitcherThemeColorPreview>;
  setThemeId: (id: string) => void;
  colorMode?: ThemeSwitcherColorMode;
  setColorMode?: (colorMode: ThemeSwitcherColorMode) => void;
}

export const ThemeSwitcherContext = createContext<
  ThemeSwitcherContextValue | undefined
>(undefined);

/** Returns the active theme context, or undefined when outside ThemeSwitcher.Root. */
export function useThemeSwitcher() {
  return useContext(ThemeSwitcherContext);
}
