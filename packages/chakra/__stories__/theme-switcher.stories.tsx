import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  system as horizonSystem,
  previewColors as horizonColors,
} from '../src/themes/horizon';
import {
  system as cypressSystem,
  previewColors as cypressColors,
} from '../src/themes/cypress';
import { ThemeSwitcherContext } from '../src/components/theme-switcher/use-theme-switcher';
import { ThemeSwitcher } from '../src/components/theme-switcher';
import type { SystemContext } from '@chakra-ui/react';

const themes: Record<string, SystemContext> = {
  horizon: horizonSystem,
  cypress: cypressSystem,
};

const themeColors = {
  horizon: horizonColors,
  cypress: cypressColors,
};

function StorybookThemeBridge({
  initialThemeId,
  children,
}: {
  initialThemeId: string;
  children: React.ReactNode;
}) {
  const [themeId, setThemeId] = useState(initialThemeId);
  const activeSystem = themes[themeId] ?? horizonSystem;

  return (
    <ThemeSwitcherContext.Provider
      value={{
        themeId,
        availableThemes: Object.keys(themes),
        activeSystem,
        themeColors,
        setThemeId,
      }}
    >
      {children}
    </ThemeSwitcherContext.Provider>
  );
}

const meta = {
  title: 'Components/ThemeSwitcher',
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const themeId = (context.globals.theme as string) ?? 'horizon';
      return (
        <StorybookThemeBridge key={themeId} initialThemeId={themeId}>
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
