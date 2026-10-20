import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Text } from '@chakra-ui/react';
import { MdDashboard, MdPerson, MdSettings, MdSecurity } from 'react-icons/md';
import { Sidebar, HorizonSidebarCard } from '../src/horizon/components/sidebar';
import type { RoutesType } from '../src/types';

const sampleRoutes: RoutesType[] = [
  { name: 'Dashboard', path: '/dashboard', icon: <MdDashboard /> },
  { name: 'Profile', path: '/profile', icon: <MdPerson /> },
  {
    name: 'Settings',
    icon: <MdSettings />,
    children: [
      { name: 'Account', path: '/settings/account', icon: <MdSettings /> },
      { name: 'Security', path: '/settings/security', icon: <MdSecurity /> },
    ],
  },
];

const meta = {
  title: 'Horizon/Sidebar',
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

export const Header: StoryObj = {
  render: () => (
    <Box w="300px" p={4}>
      <Sidebar.Header>
        <Text fontWeight="bold" fontSize="xl">
          RMF2 Dashboard
        </Text>
      </Sidebar.Header>
    </Box>
  ),
};

export const Footer: StoryObj = {
  render: () => (
    <Box w="300px" bg="white" _dark={{ bg: 'navy.800' }} p={4}>
      <Sidebar.Footer>
        <Text fontSize="sm" color="gray.400">
          v1.0.0 — RMF2 UI
        </Text>
      </Sidebar.Footer>
    </Box>
  ),
};

export const Content: StoryObj = {
  render: () => (
    <Box w="300px" bg="white" _dark={{ bg: 'navy.800' }}>
      <Sidebar.Content>
        <Text>Content area children go here.</Text>
      </Sidebar.Content>
    </Box>
  ),
};

export const Items: StoryObj = {
  render: () => (
    <Box w="300px" bg="white" _dark={{ bg: 'navy.800' }} p={4}>
      <Sidebar.Root routes={sampleRoutes}>
        <Sidebar.Items />
      </Sidebar.Root>
    </Box>
  ),
};

export const ItemsActiveRoute: StoryObj = {
  parameters: { initialRoute: '/settings/account' },
  render: () => (
    <Box w="300px" bg="white" _dark={{ bg: 'navy.800' }} p={4}>
      <Sidebar.Root routes={sampleRoutes}>
        <Sidebar.Items />
      </Sidebar.Root>
    </Box>
  ),
};

export const SidebarCard: StoryObj = {
  render: () => (
    <Box w="260px" pt="60px" px={4}>
      <HorizonSidebarCard />
    </Box>
  ),
};

export const FullSidebar: StoryObj = {
  render: () => (
    <Box position="relative" w="300px" h="600px">
      <Sidebar.Root routes={sampleRoutes}>
        <Sidebar.Positioner position="relative" h="600px" display="block">
          <Sidebar.Header>
            <Text fontWeight="bold" fontSize="lg">
              RMF2 Dashboard
            </Text>
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Items />
          </Sidebar.Content>
          <Sidebar.Footer>
            <HorizonSidebarCard />
          </Sidebar.Footer>
        </Sidebar.Positioner>
      </Sidebar.Root>
    </Box>
  ),
};

export const ResponsiveSidebar: StoryObj = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <Sidebar.Root routes={sampleRoutes}>
      <Sidebar.Responsive>
        <Sidebar.Header>
          <Text fontWeight="bold" fontSize="lg">
            RMF2 Dashboard
          </Text>
        </Sidebar.Header>
        <Sidebar.Content>
          <Sidebar.Items />
        </Sidebar.Content>
      </Sidebar.Responsive>
    </Sidebar.Root>
  ),
};
