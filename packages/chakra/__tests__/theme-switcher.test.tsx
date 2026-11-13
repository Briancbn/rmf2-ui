import React, { useState } from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from './utils';
import userEvent from '@testing-library/user-event';
import { themeConfig as horizonConfig } from '../src/themes/horizon';
import { themeConfig as cypressConfig } from '../src/themes/cypress';
import {
  ThemeSwitcherContext,
  useThemeSwitcherStorybook,
  useThemeSwitcherActiveTheme,
} from '../src/components/theme-switcher/use-theme-switcher';
import type { ThemeSwitcherColorMode } from '../src/components/theme-switcher/use-theme-switcher';
import { ThemeSwitcher } from '../src/components/theme-switcher';

const themeConfigs = [horizonConfig, cypressConfig];

function TestBridge({
  initialThemeId = 'horizon',
  initialColorMode = 'light' as ThemeSwitcherColorMode,
  children,
}: {
  initialThemeId?: string;
  initialColorMode?: ThemeSwitcherColorMode;
  children: React.ReactNode;
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

function ActiveThemeDisplay() {
  const theme = useThemeSwitcherActiveTheme();
  return <span data-testid="active-theme">{theme.id}</span>;
}

describe('useThemeSwitcherActiveTheme', () => {
  it('returns the active theme config', () => {
    render(
      <TestBridge initialThemeId="cypress">
        <ActiveThemeDisplay />
      </TestBridge>,
    );
    expect(screen.getByTestId('active-theme')).toHaveTextContent('cypress');
  });

  it('falls back to horizon when themeId is unknown', () => {
    render(
      <TestBridge initialThemeId="unknown">
        <ActiveThemeDisplay />
      </TestBridge>,
    );
    expect(screen.getByTestId('active-theme')).toHaveTextContent('horizon');
  });
});

describe('ThemeSwitcher.Button', () => {
  it('renders the current theme label', () => {
    render(
      <TestBridge initialThemeId="horizon">
        <ThemeSwitcher.Button />
      </TestBridge>,
    );
    expect(
      screen.getByRole('button', { name: /horizon/i }),
    ).toBeInTheDocument();
  });

  it('cycles to the next theme on click', async () => {
    const user = userEvent.setup();
    render(
      <TestBridge initialThemeId="horizon">
        <ThemeSwitcher.Button />
      </TestBridge>,
    );
    await user.click(screen.getByRole('button', { name: /horizon/i }));
    expect(
      screen.getByRole('button', { name: /cypress/i }),
    ).toBeInTheDocument();
  });

  it('wraps back to the first theme', async () => {
    const user = userEvent.setup();
    render(
      <TestBridge initialThemeId="cypress">
        <ThemeSwitcher.Button />
      </TestBridge>,
    );
    await user.click(screen.getByRole('button', { name: /cypress/i }));
    expect(
      screen.getByRole('button', { name: /horizon/i }),
    ).toBeInTheDocument();
  });
});

describe('ThemeSwitcher.Select', () => {
  it('renders a button for each theme', () => {
    render(
      <TestBridge>
        <ThemeSwitcher.Select />
      </TestBridge>,
    );
    expect(
      screen.getByRole('button', { name: /horizon/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /cypress/i }),
    ).toBeInTheDocument();
  });

  it('switches theme on click', async () => {
    const user = userEvent.setup();
    render(
      <TestBridge initialThemeId="horizon">
        <ThemeSwitcher.Select />
        <ActiveThemeDisplay />
      </TestBridge>,
    );
    await user.click(screen.getByRole('button', { name: /cypress/i }));
    expect(screen.getByTestId('active-theme')).toHaveTextContent('cypress');
  });
});

describe('ThemeSwitcher.ColorModeSwitch', () => {
  it('renders nothing when colorMode is not provided', () => {
    const ctx = {
      themeId: 'horizon',
      themes: new Map(themeConfigs.map((t) => [t.id, t])),
      setThemeId: () => {},
      colorMode: undefined,
      setColorMode: undefined,
    };
    const { container } = render(
      <ThemeSwitcherContext.Provider value={ctx}>
        <ThemeSwitcher.ColorModeSwitch />
      </ThemeSwitcherContext.Provider>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('toggles colorMode on click', async () => {
    const user = userEvent.setup();
    render(
      <TestBridge initialColorMode="light">
        <ThemeSwitcher.ColorModeSwitch />
      </TestBridge>,
    );
    const toggle = screen.getByRole('checkbox');
    expect(toggle).not.toBeChecked();
    await user.click(toggle);
    expect(toggle).toBeChecked();
  });
});

describe('useThemeSwitcher localStorage', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('restores the last selected theme from localStorage', async () => {
    localStorage.setItem('rmf2-theme', 'cypress');

    render(
      <ThemeSwitcher.Root
        themes={themeConfigs}
        colorMode="light"
        setColorMode={() => {}}
      >
        <ActiveThemeDisplay />
      </ThemeSwitcher.Root>,
    );

    expect(screen.getByTestId('active-theme')).toHaveTextContent('cypress');
  });

  it('persists the selected theme to localStorage', async () => {
    const user = userEvent.setup();
    render(
      <ThemeSwitcher.Root
        themes={themeConfigs}
        colorMode="light"
        setColorMode={() => {}}
      >
        <ThemeSwitcher.Button />
        <ActiveThemeDisplay />
      </ThemeSwitcher.Root>,
    );

    await user.click(screen.getByRole('button', { name: /horizon/i }));
    expect(localStorage.getItem('rmf2-theme')).toBe('cypress');
  });
});
