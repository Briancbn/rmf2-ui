import React, { useState } from 'react';
import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { themeConfig as horizonConfig } from '../src/themes/horizon';
import { themeConfig as cypressConfig } from '../src/themes/cypress';
import {
  ThemeSwitcherContext,
  useThemeSwitcherStorybook,
} from '../src/components/theme-switcher/use-theme-switcher';
import type { ThemeSwitcherColorMode } from '../src/components/theme-switcher/use-theme-switcher';
import { ThemeSwitcher } from '../src/components/theme-switcher';

const themeConfigs = [horizonConfig, cypressConfig];

function StorybookThemeBridge({
  initialThemeId,
  initialColorMode = 'light',
  children,
}: {
  initialThemeId: string;
  initialColorMode?: ThemeSwitcherColorMode;
  children: ReactNode;
}) {
  const [themeId, setThemeId] = useState(initialThemeId);
  const [colorMode, setColorMode] =
    useState<ThemeSwitcherColorMode>(initialColorMode);

  const ctx = useThemeSwitcherStorybook({
    themes: themeConfigs,
    themeId,
    setThemeId,
    colorMode,
    setColorMode,
  });

  return (
    <ThemeSwitcherContext.Provider value={ctx}>
      {children}
    </ThemeSwitcherContext.Provider>
  );
}

const meta = {
  title: 'RMF2-UI/ThemeSwitcher',
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const themeId = (context.globals.theme as string) ?? 'horizon';
      const colorMode =
        (context.globals.colorScheme as ThemeSwitcherColorMode) ?? 'light';
      return (
        <StorybookThemeBridge
          initialThemeId={themeId}
          initialColorMode={colorMode}
        >
          <Story />
        </StorybookThemeBridge>
      );
    },
  ],
} satisfies Meta;

export default meta;

export const Button: StoryObj = {
  render: () => <ThemeSwitcher.Button />,
};

export const Select: StoryObj = {
  render: () => <ThemeSwitcher.Select />,
};

export const ColorModeSwitch: StoryObj = {
  render: () => <ThemeSwitcher.ColorModeSwitch />,
};
