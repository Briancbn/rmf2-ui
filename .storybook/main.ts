import { mergeConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../packages/chakra/__stories__/**/*.stories.@(ts|tsx)'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    return mergeConfig(config, {
      plugins: [
        react(),
        tsconfigPaths({ projects: ['./packages/chakra/tsconfig.json'] }),
      ],
    });
  },
};

export default config;
