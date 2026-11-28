import React from 'react';
import type { Preview } from '@storybook/react';
import { Box, ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router';
import { ThemeProvider } from 'next-themes';
import { themeConfig as horizonConfig } from '../packages/chakra/src/themes/horizon';
import { themeConfig as cypressConfig } from '../packages/chakra/src/themes/cypress';
import './horizon-fonts.css';
import './cypress-fonts.css';

const themeConfigs = [horizonConfig, cypressConfig];

const themeFonts: Record<string, string> = {
  horizon: 'DM Sans',
  cypress: 'Open Sans',
};

const preview: Preview = {
  globalTypes: {
    colorScheme: {
      description: 'Color scheme',
      defaultValue: 'light',
      toolbar: {
        title: 'Color Scheme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
    theme: {
      description: 'UI Theme',
      defaultValue: 'horizon',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: themeConfigs.map((t) => ({
          value: t.id,
          title: t.label ?? t.id,
        })),
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const colorScheme = (context.globals.colorScheme as string) ?? 'light';
      const themeId = (context.globals.theme as string) ?? 'horizon';
      const activeConfig =
        themeConfigs.find((t) => t.id === themeId) ?? horizonConfig;
      const fontFamily = themeFonts[themeId] ?? 'DM Sans';
      const initialRoute =
        (context.parameters.initialRoute as string) ?? '/dashboard';

      return (
        <MemoryRouter initialEntries={[initialRoute]}>
          <ChakraProvider value={activeConfig.system}>
            <ThemeProvider
              attribute="class"
              forcedTheme={colorScheme}
              disableTransitionOnChange
            >
              <Box
                minH="100vh"
                bg="bg"
                fontFamily={fontFamily}
                letterSpacing="-0.5px"
                p={4}
              >
                <Story />
              </Box>
            </ThemeProvider>
          </ChakraProvider>
        </MemoryRouter>
      );
    },
  ],
};

export default preview;
