'use client';

import type { IconButtonProps, SpanProps } from '@chakra-ui/react';
import {
  Icon,
  ClientOnly,
  IconButton,
  Skeleton,
  Span,
  Switch,
} from '@chakra-ui/react';
import { useThemeSwitcher } from '@rmf2-ui/chakra';
import { ThemeProvider, useTheme } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';
import * as React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa6';

export interface ColorModeProviderProps extends ThemeProviderProps {}

export function ColorModeProvider(props: ColorModeProviderProps) {
  return <ThemeProvider attribute="class" {...props} />;
}

export type ColorMode = 'light' | 'dark';

export interface UseColorModeReturn {
  colorMode: ColorMode;
  setColorMode: (colorMode: ColorMode) => void;
  toggleColorMode: () => void;
}

export function useColorMode(): UseColorModeReturn {
  const { resolvedTheme, setTheme, forcedTheme } = useTheme();
  const colorMode = forcedTheme || resolvedTheme;
  const toggleColorMode = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };
  return {
    colorMode: colorMode as ColorMode,
    setColorMode: setTheme,
    toggleColorMode,
  };
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode();
  return colorMode === 'dark' ? dark : light;
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode();
  return colorMode === 'dark' ? <FaMoon /> : <FaSun />;
}

export const ColorModeSwitch = React.forwardRef<
  HTMLInputElement,
  Omit<Switch.RootProps, 'children'>
>(function ColorModeSwitch(props, ref) {
  const { colorMode, setColorMode } = useColorMode();
  const themeCtx = useThemeSwitcher();
  const themeColors = themeCtx
    ? themeCtx.themeColors[themeCtx.themeId]
    : undefined;
  const lightBg = themeColors?.bg ?? '#ffffff';
  const darkBg = themeColors?.darkBg ?? '#1a202c';

  return (
    <ClientOnly fallback={<Skeleton w="70px" h="36px" borderRadius="full" />}>
      <Switch.Root
        checked={colorMode === 'dark'}
        onCheckedChange={(e) => setColorMode(e.checked ? 'dark' : 'light')}
        aria-label="Toggle color mode"
        css={{
          '--switch-width': '70px',
          '--switch-height': '36px',
        }}
        {...props}
      >
        <Switch.HiddenInput ref={ref} />
        <Switch.Control bg="brand.600" _checked={{ bg: 'brand.500' }}>
          <Switch.Thumb bg={colorMode === 'dark' ? darkBg : lightBg} />
          <Switch.Indicator
            fallback={
              <Icon
                as={FaSun}
                style={{ width: '20px', height: '20px' }}
                color="yellow.400"
              />
            }
          >
            <FaMoon
              style={{ width: '20px', height: '20px' }}
              color="gray.400"
            />
          </Switch.Indicator>
        </Switch.Control>
      </Switch.Root>
    </ClientOnly>
  );
});

interface ColorModeButtonProps extends Omit<IconButtonProps, 'aria-label'> {}

export const ColorModeButton = React.forwardRef<
  HTMLButtonElement,
  ColorModeButtonProps
>(function ColorModeButton(props, ref) {
  const { toggleColorMode } = useColorMode();
  return (
    <ClientOnly fallback={<Skeleton boxSize="8" />}>
      <IconButton
        onClick={toggleColorMode}
        variant="ghost"
        aria-label="Toggle color mode"
        size="sm"
        ref={ref}
        {...props}
        css={{
          _icon: {
            width: '18px',
            height: '18px',
          },
        }}
      >
        <ColorModeIcon />
      </IconButton>
    </ClientOnly>
  );
});

export const LightMode = React.forwardRef<HTMLSpanElement, SpanProps>(
  function LightMode(props, ref) {
    return (
      <Span
        color="fg"
        display="contents"
        className="chakra-theme light"
        colorPalette="gray"
        colorScheme="light"
        ref={ref}
        {...props}
      />
    );
  },
);

export const DarkMode = React.forwardRef<HTMLSpanElement, SpanProps>(
  function DarkMode(props, ref) {
    return (
      <Span
        color="fg"
        display="contents"
        className="chakra-theme dark"
        colorPalette="gray"
        colorScheme="dark"
        ref={ref}
        {...props}
      />
    );
  },
);
