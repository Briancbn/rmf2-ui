import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { ThemeSwitcherContext, useThemeSwitcher } from './use-theme-switcher';
import type {
  ThemeSwitcherThemeConfig,
  ThemeSwitcherColorMode,
} from './use-theme-switcher';

export interface ThemeSwitcherRootProps {
  children: ReactNode;
  themes?: ThemeSwitcherThemeConfig[];
  defaultTheme?: string;
  colorMode?: ThemeSwitcherColorMode;
  setColorMode?: (colorMode: ThemeSwitcherColorMode) => void;
}

export function ThemeSwitcherRoot({
  children,
  themes,
  defaultTheme,
  colorMode,
  setColorMode,
}: ThemeSwitcherRootProps) {
  const context = useThemeSwitcher({
    themes,
    defaultTheme,
    colorMode,
    setColorMode,
  });
  const ctx = useMemo(() => ({ ...context }), [context]);

  return (
    <ThemeSwitcherContext.Provider value={ctx}>
      {children}
    </ThemeSwitcherContext.Provider>
  );
}
