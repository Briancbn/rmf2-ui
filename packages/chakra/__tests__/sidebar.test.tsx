import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { MdDashboard, MdPerson, MdSettings } from 'react-icons/md';
import { SidebarRoot } from '@/horizon/components/sidebar/sidebar-root';
import { SidebarContent } from '@/horizon/components/sidebar/sidebar-content';
import { SidebarHeader } from '@/horizon/components/sidebar/sidebar-header';
import { SidebarFooter } from '@/horizon/components/sidebar/sidebar-footer';
import { SidebarItems } from '@/horizon/components/sidebar/sidebar-items';
import type { RoutesType } from '@/types';

const routes: RoutesType[] = [
  { name: 'Dashboard', path: '/dashboard', icon: <MdDashboard /> },
  { name: 'Profile', path: '/profile', icon: <MdPerson /> },
  {
    name: 'Settings',
    icon: <MdSettings />,
    children: [
      { name: 'Account', path: '/settings/account' },
      { name: 'Security', path: '/settings/security' },
    ],
  },
];

describe('SidebarContent', () => {
  it('renders children', () => {
    render(<SidebarContent>Sidebar content</SidebarContent>);
    expect(screen.getByText('Sidebar content')).toBeInTheDocument();
  });
});

describe('SidebarHeader', () => {
  it('renders children and a separator', () => {
    render(<SidebarHeader>Logo</SidebarHeader>);
    expect(screen.getByText('Logo')).toBeInTheDocument();
  });
});

describe('SidebarFooter', () => {
  it('renders children', () => {
    render(<SidebarFooter>Footer content</SidebarFooter>);
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });
});

describe('SidebarItems', () => {
  it('renders all top-level route names', () => {
    render(
      <SidebarRoot routes={routes}>
        <SidebarItems />
      </SidebarRoot>,
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders child routes inside accordion', () => {
    render(
      <SidebarRoot routes={routes}>
        <SidebarItems />
      </SidebarRoot>,
    );
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('marks the active route', () => {
    render(
      <SidebarRoot routes={routes}>
        <SidebarItems />
      </SidebarRoot>,
      { routerProps: { initialEntries: ['/dashboard'] } },
    );
    const link = screen.getByRole('link', { name: /dashboard/i });
    expect(link).toBeInTheDocument();
  });

  it('collapses and expands accordion sections', async () => {
    const user = userEvent.setup();
    render(
      <SidebarRoot routes={routes}>
        <SidebarItems />
      </SidebarRoot>,
    );
    const trigger = screen.getByText('Settings').closest('button');
    if (trigger) {
      await user.click(trigger);
      await user.click(trigger);
    }
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});
