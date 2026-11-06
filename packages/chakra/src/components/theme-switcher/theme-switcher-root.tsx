import { useState, type ReactNode } from 'react';
import { type SystemContext } from '@chakra-ui/react';
import { system as horizonSystem } from '@/themes/horizon';
import { ThemeSwitcherContext } from './use-theme-switcher';

export interface ThemeSwitcherRootProps {
  children: ReactNode;
  /** Additional systems to register. The 'horizon' key is always available. */
  themes?: Record<string, SystemContext>;
  defaultTheme?: string;
}

export function ThemeSwitcherRoot({
  children,
  themes = {},
  defaultTheme = 'horizon',
}: ThemeSwitcherRootProps) {
  const allThemes: Record<string, SystemContext> = {
    horizon: horizonSystem,
    ...themes,
  };
  const [themeId, setThemeId] = useState(() =>
    defaultTheme in allThemes ? defaultTheme : 'horizon',
  );
  const activeSystem = allThemes[themeId] ?? horizonSystem;

  return (
    <ThemeSwitcherContext.Provider
      value={{
        themeId,
        availableThemes: Object.keys(allThemes),
        activeSystem,
        setThemeId,
      }}
    >
      {children}
    </ThemeSwitcherContext.Provider>
  );
}
