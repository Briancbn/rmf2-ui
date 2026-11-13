import { createContext, useCallback, useContext, useState } from 'react';
import type { SystemContext } from '@chakra-ui/react';
import { themeConfig as horizonConfig } from '@/themes/horizon';

export type ThemeSwitcherColorMode = 'light' | 'dark';

export interface ThemeSwitcherThemeColorPreview {
  brand: string;
  bg: string;
  darkBg: string;
}

export interface ThemeSwitcherThemeConfig {
  id: string;
  label?: string;
  system: SystemContext;
  colorPreview?: ThemeSwitcherThemeColorPreview;
}

export interface UseThemeSwitcherProps {
  themes?: ThemeSwitcherThemeConfig[];
  defaultTheme?: string;
  colorMode?: ThemeSwitcherColorMode;
  setColorMode?: (colorMode: ThemeSwitcherColorMode) => void;
}

// Change this key to namespace theme persistence per app or environment.
const STORAGE_KEY = 'rmf2-theme';

export function useThemeSwitcher({
  themes: themesList,
  defaultTheme,
  colorMode,
  setColorMode,
}: UseThemeSwitcherProps) {
  const themes = new Map((themesList ?? []).map((t) => [t.id, t]));

  const [themeId, setThemeIdState] = useState(() => {
    // No themes registered — fall back to horizon.
    if (themes.size === 0) return 'horizon';

    try {
      // Restore the last theme the user selected, if it is still a registered theme.
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && themes.has(stored)) return stored;
    } catch (_) {
      /* localStorage unavailable (SSR / private browsing) */
    }

    // Falls back to the first theme if defaultTheme is not registered.
    const first = themes.keys().next().value as string;
    if (defaultTheme === undefined) return first;
    return themes.has(defaultTheme) ? defaultTheme : first;
  });

  const setThemeId = useCallback((id: string) => {
    setThemeIdState(id);
    try {
      // Persist the selected theme across page reloads.
      localStorage.setItem(STORAGE_KEY, id);
    } catch (_) {
      /* localStorage unavailable */
    }
  }, []);

  return { themeId, themes, setThemeId, colorMode, setColorMode };
}

export type UseThemeSwitcherReturn = ReturnType<typeof useThemeSwitcher>;

export interface UseThemeSwitcherStorybookProps {
  themes?: ThemeSwitcherThemeConfig[];
  themeId: string;
  setThemeId: (id: string) => void;
  colorMode?: ThemeSwitcherColorMode;
  setColorMode?: (colorMode: ThemeSwitcherColorMode) => void;
}

export function useThemeSwitcherStorybook({
  themes: themesList,
  themeId,
  setThemeId,
  colorMode,
  setColorMode,
}: UseThemeSwitcherStorybookProps): UseThemeSwitcherReturn {
  const themes = new Map((themesList ?? []).map((t) => [t.id, t]));
  return { themeId, themes, setThemeId, colorMode, setColorMode };
}

export const ThemeSwitcherContext = createContext<
  UseThemeSwitcherReturn | undefined
>(undefined);

const useThemeSwitcherContext = (): UseThemeSwitcherReturn => {
  const ctx = useContext(ThemeSwitcherContext);
  if (!ctx) {
    throw new Error(
      'useThemeSwitcherContext must be used inside ThemeSwitcher.Root',
    );
  }
  return ctx;
};

export function useThemeSwitcherSelect() {
  const { themeId, themes, setThemeId } = useThemeSwitcherContext();
  return { themeId, themes, setThemeId };
}

export function useThemeSwitcherButton() {
  const { themeId, themes, setThemeId } = useThemeSwitcherContext();
  return { themeId, themes, setThemeId };
}

export function useThemeSwitcherActiveTheme(): ThemeSwitcherThemeConfig {
  const { themeId, themes } = useThemeSwitcherContext();
  return themes.get(themeId) ?? horizonConfig;
}

export function useThemeSwitcherColorModeSwitch() {
  const { themeId, themes, colorMode, setColorMode } =
    useThemeSwitcherContext();
  const colorPreview = themes.get(themeId)?.colorPreview;
  return { colorMode, setColorMode, colorPreview };
}
