import { createSystem, defineConfig, defaultConfig } from '@chakra-ui/react';
import { globalCss, globalTokens, semanticTokens } from './styles';
import {
  buttonRecipe,
  inputRecipe,
  cardRecipe,
  bannerRecipe,
  sidebarRecipe,
  pendingRecipe,
} from './recipes';

export const systemConfig = defineConfig({
  theme: {
    tokens: globalTokens,
    semanticTokens,
    recipes: {
      button: buttonRecipe,
      input: inputRecipe,
      card: cardRecipe,
    },
    slotRecipes: {
      banner: bannerRecipe,
      sidebar: sidebarRecipe,
      pending: pendingRecipe,
    },
  },
  globalCss,
});

export const system = createSystem(defaultConfig, systemConfig);

export default system;
