import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { mergeConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { StorybookConfig } from '@storybook/react-vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  stories: ['../packages/chakra/__stories__/**/*.stories.@(ts|tsx)'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    return mergeConfig(config, {
      plugins: [react()],
      resolve: {
        alias: {
          '@': resolve(__dirname, '../packages/chakra/src'),
        },
      },
    });
  },
};

export default config;
