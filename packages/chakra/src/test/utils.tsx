import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router';
import system from '@/horizon/theme/theme';

interface WrapperProps {
  children: React.ReactNode;
  routerProps?: MemoryRouterProps;
}

function Providers({ children, routerProps }: WrapperProps) {
  return (
    <MemoryRouter initialEntries={['/dashboard']} {...routerProps}>
      <ChakraProvider value={system}>{children}</ChakraProvider>
    </MemoryRouter>
  );
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  routerProps?: MemoryRouterProps;
}

function customRender(
  ui: React.ReactElement,
  { routerProps, ...options }: CustomRenderOptions = {},
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <Providers routerProps={routerProps}>{children}</Providers>
    ),
    ...options,
  });
}

export * from '@testing-library/react';
export { customRender as render };
