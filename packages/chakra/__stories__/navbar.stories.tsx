import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@chakra-ui/react';
import { NavbarRoot } from '@/horizon/components/navbar/navbar-root';
import { NavbarHeader } from '@/horizon/components/navbar/navbar-header';
import { NavbarBreadcrumb } from '@/horizon/components/navbar/navbar-breadcrumb';
import { NavbarTitle } from '@/horizon/components/navbar/navbar-title';
import { NavbarToolbar } from '@/horizon/components/navbar/navbar-toolbar';
import { HorizonNavbarInfo } from '@/horizon/components/navbar/horizon-navbar-info';
import { HorizonNavbarNotification } from '@/horizon/components/navbar/horizon-navbar-notifications';
import type { RoutesType } from '@/types';

const sampleRoutes: RoutesType[] = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Profile', path: '/profile' },
  {
    name: 'Settings',
    children: [
      { name: 'Account', path: '/settings/account' },
      { name: 'Security', path: '/settings/security' },
    ],
  },
];

const meta = {
  title: 'Horizon/Navbar',
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

export const Header: StoryObj = {
  render: () => (
    <NavbarRoot routes={sampleRoutes} position="static" w="100%">
      <NavbarHeader>
        <NavbarTitle />
      </NavbarHeader>
    </NavbarRoot>
  ),
};

export const Toolbar: StoryObj = {
  render: () => (
    <NavbarToolbar>
      <HorizonNavbarNotification />
      <HorizonNavbarInfo />
    </NavbarToolbar>
  ),
};

export const NotificationMenu: StoryObj = {
  render: () => <HorizonNavbarNotification />,
};

export const InfoMenu: StoryObj = {
  render: () => <HorizonNavbarInfo />,
};

export const FullNavbar: StoryObj = {
  render: () => (
    <NavbarRoot routes={sampleRoutes} position="static" w="100%">
      <NavbarHeader>
        <NavbarBreadcrumb />
        <NavbarTitle />
      </NavbarHeader>
      <NavbarToolbar>
        <HorizonNavbarNotification />
        <HorizonNavbarInfo />
        <Button size="sm" variant="brand" ms={2}>
          Sign In
        </Button>
      </NavbarToolbar>
    </NavbarRoot>
  ),
};

export const NavbarOnMatchedRoute: StoryObj = {
  parameters: { initialRoute: '/settings/account' },
  render: () => (
    <NavbarRoot routes={sampleRoutes} position="static" w="100%">
      <NavbarHeader>
        <NavbarBreadcrumb />
        <NavbarTitle />
      </NavbarHeader>
      <NavbarToolbar>
        <HorizonNavbarNotification />
        <HorizonNavbarInfo />
      </NavbarToolbar>
    </NavbarRoot>
  ),
};

export const TitleOnly: StoryObj = {
  render: () => (
    <NavbarRoot routes={sampleRoutes} position="static" w="100%">
      <NavbarHeader>
        <NavbarTitle>Custom Title</NavbarTitle>
      </NavbarHeader>
    </NavbarRoot>
  ),
};
