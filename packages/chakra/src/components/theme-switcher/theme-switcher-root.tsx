import type { ReactNode } from 'react';
import { useState } from 'react';
import type { SystemContext } from '@chakra-ui/react';
import { system as horizonSystem } from '@/themes/horizon';
import { ThemeSwitcherContext } from './use-theme-switcher';
import type {
  ThemeSwitcherColorMode,
  ThemeSwitcherThemeColorPreview,
} from './use-theme-switcher';

const STORAGE_KEY = 'rmf2-theme';

export interface ThemeSwitcherRootProps {
  children: ReactNode;
  themes?: Record<string, SystemContext>;
  themeColors?: Record<string, ThemeSwitcherThemeColorPreview>;
  defaultTheme?: string;
  colorMode?: ThemeSwitcherColorMode;
  setColorMode?: (colorMode: ThemeSwitcherColorMode) => void;
}

export function ThemeSwitcherRoot({
  children,
  themes = {},
  themeColors = {},
  defaultTheme = 'horizon',
  colorMode,
  setColorMode,
}: ThemeSwitcherRootProps) {
  const allThemes: Record<string, SystemContext> = {
    horizon: horizonSystem,
    ...themes,
  };
  const [themeId, setThemeIdState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored in allThemes) return stored;
    } catch (_) {
      // localStorage unavailable (private browsing, etc.)
    }
    return defaultTheme in allThemes ? defaultTheme : 'horizon';
  });

  const setThemeId = (id: string) => {
    setThemeIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch (_) {
      // localStorage unavailable
    }
  };

  const activeSystem = allThemes[themeId] ?? horizonSystem;

  return (
    <ThemeSwitcherContext.Provider
      value={{
        themeId,
        availableThemes: Object.keys(allThemes),
        activeSystem,
        themeColors,
        setThemeId,
        colorMode,
        setColorMode,
      }}
    >
      {children}
    </ThemeSwitcherContext.Provider>
  );
}
