import { createSystem, defineConfig, defaultConfig } from '@chakra-ui/react';
import { globalCss, globalTokens } from './styles';
import { buttonRecipe, inputRecipe } from './recipes';

const customConfig = defineConfig({
  theme: {
    tokens: globalTokens,
    recipes: {
      button: buttonRecipe,
      input: inputRecipe,
    },
  },
  globalCss: globalCss,
});

export const system = createSystem(defaultConfig, customConfig);

export default system;
