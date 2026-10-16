import React from 'react';
import type { Preview } from '@storybook/react';
import { Box, ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router';
import system from '../packages/chakra/src/horizon/theme/theme';
import './horizon-fonts.css';

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
      const initialRoute = (context.parameters.initialRoute as string) ?? '/dashboard';

      return (
        <MemoryRouter initialEntries={[initialRoute]}>
          <ChakraProvider value={system}>
            <Box
              className={colorScheme}
              minH="100vh"
              bg="bg"
              fontFamily="DM Sans"
              letterSpacing="-0.5px"
              p={4}
            >
              <Story />
            </Box>
          </ChakraProvider>
        </MemoryRouter>
      );
    },
  ],
};

export default preview;
