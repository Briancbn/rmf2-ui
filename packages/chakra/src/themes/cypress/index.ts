import { createSystem, defineConfig, defaultConfig } from '@chakra-ui/react';
import { globalTokens } from './tokens';
import { semanticTokens } from './semantic-tokens';
import { globalCss } from './global-css';
import { recipes } from './recipes';
import { slotRecipes } from './slot-recipes';
import type { ThemeSwitcherThemeConfig } from '@/components/theme-switcher/use-theme-switcher';

export const systemConfig = defineConfig({
  theme: {
    tokens: globalTokens,
    semanticTokens,
    recipes,
    slotRecipes,
  },
  globalCss,
});

export const system = createSystem(defaultConfig, systemConfig);

export const previewColors = {
  brand: '#319795',
  bg: '#ffffff',
  darkBg: '#000000',
};

export const themeConfig: ThemeSwitcherThemeConfig = {
  id: 'cypress',
  label: 'Cypress',
  system,
  colorPreview: previewColors,
};
