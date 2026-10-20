import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@chakra-ui/react';
import {
  Navbar,
  HorizonNavbarInfo,
  HorizonNavbarNotification,
} from '../src/horizon/components/navbar';
import type { RoutesType } from '../src/types';

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
    <Navbar.Root routes={sampleRoutes} position="static" w="100%">
      <Navbar.Header>
        <Navbar.Title />
      </Navbar.Header>
    </Navbar.Root>
  ),
};

export const Toolbar: StoryObj = {
  render: () => (
    <Navbar.Toolbar>
      <HorizonNavbarNotification />
      <HorizonNavbarInfo />
    </Navbar.Toolbar>
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
    <Navbar.Root routes={sampleRoutes} position="static" w="100%">
      <Navbar.Header>
        <Navbar.Breadcrumb />
        <Navbar.Title />
      </Navbar.Header>
      <Navbar.Toolbar>
        <HorizonNavbarNotification />
        <HorizonNavbarInfo />
        <Button size="sm" variant="brand" ms={2}>
          Sign In
        </Button>
      </Navbar.Toolbar>
    </Navbar.Root>
  ),
};

export const NavbarOnMatchedRoute: StoryObj = {
  parameters: { initialRoute: '/settings/account' },
  render: () => (
    <Navbar.Root routes={sampleRoutes} position="static" w="100%">
      <Navbar.Header>
        <Navbar.Breadcrumb />
        <Navbar.Title />
      </Navbar.Header>
      <Navbar.Toolbar>
        <HorizonNavbarNotification />
        <HorizonNavbarInfo />
      </Navbar.Toolbar>
    </Navbar.Root>
  ),
};

export const TitleOnly: StoryObj = {
  render: () => (
    <Navbar.Root routes={sampleRoutes} position="static" w="100%">
      <Navbar.Header>
        <Navbar.Title>Custom Title</Navbar.Title>
      </Navbar.Header>
    </Navbar.Root>
  ),
};
