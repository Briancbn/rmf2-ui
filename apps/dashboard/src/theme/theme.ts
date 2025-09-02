import { createSystem, defineConfig, defaultConfig } from '@chakra-ui/react';
import { globalCss, globalTokens } from './styles';

const customConfig = defineConfig({
  theme: {
    tokens: globalTokens,
  },
  globalCss: globalCss,
});

export const horizonSystem = createSystem(defaultConfig, customConfig);
