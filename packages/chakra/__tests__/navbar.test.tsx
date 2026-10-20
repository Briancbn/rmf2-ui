import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { NavbarRoot } from '@/horizon/components/navbar/navbar-root';
import { NavbarHeader } from '@/horizon/components/navbar/navbar-header';
import { NavbarTitle } from '@/horizon/components/navbar/navbar-title';
import { NavbarToolbar } from '@/horizon/components/navbar/navbar-toolbar';
import { HorizonNavbarInfo } from '@/horizon/components/navbar/horizon-navbar-info';
import { HorizonNavbarNotification } from '@/horizon/components/navbar/horizon-navbar-notifications';
import type { RoutesType } from '@/types';

const routes: RoutesType[] = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Profile', path: '/profile' },
];

describe('NavbarHeader', () => {
  it('renders children', () => {
    render(<NavbarHeader>Header content</NavbarHeader>);
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });
});

describe('NavbarToolbar', () => {
  it('renders children', () => {
    render(<NavbarToolbar>Toolbar content</NavbarToolbar>);
    expect(screen.getByText('Toolbar content')).toBeInTheDocument();
  });
});

describe('NavbarTitle', () => {
  it('renders the active route name from context', () => {
    render(
      <NavbarRoot routes={routes}>
        <NavbarTitle />
      </NavbarRoot>,
      { routerProps: { initialEntries: ['/dashboard'] } },
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders custom children over route name', () => {
    render(
      <NavbarRoot routes={routes}>
        <NavbarTitle>Custom Title</NavbarTitle>
      </NavbarRoot>,
    );
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });
});

describe('HorizonNavbarInfo', () => {
  it('renders the info trigger icon', () => {
    render(<HorizonNavbarInfo />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('opens the info menu on click', async () => {
    const user = userEvent.setup();
    render(<HorizonNavbarInfo />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText(/Buy Horizon UI PRO/i)).toBeInTheDocument();
  });
});

describe('HorizonNavbarNotification', () => {
  it('renders the notification trigger', () => {
    render(<HorizonNavbarNotification />);
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('opens the notification menu on click', async () => {
    const user = userEvent.setup();
    render(<HorizonNavbarNotification />);
    const trigger = document.querySelector('[data-scope="menu"]')!;
    await user.click(trigger);
    expect(screen.queryByText('Notifications')).toBeInTheDocument();
  });
});

describe('NavbarRoot', () => {
  it('renders without crashing', () => {
    const { container } = render(<NavbarRoot routes={routes} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders children inside the navbar', () => {
    render(
      <NavbarRoot routes={routes}>
        <NavbarHeader>
          <NavbarTitle />
        </NavbarHeader>
        <NavbarToolbar>
          <HorizonNavbarInfo />
        </NavbarToolbar>
      </NavbarRoot>,
      { routerProps: { initialEntries: ['/dashboard'] } },
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
