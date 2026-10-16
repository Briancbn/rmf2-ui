import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Text } from '@chakra-ui/react';
import { MdDashboard, MdPerson, MdSettings, MdSecurity } from 'react-icons/md';
import { SidebarRoot } from '@/horizon/components/sidebar/sidebar-root';
import { SidebarContent } from '@/horizon/components/sidebar/sidebar-content';
import { SidebarHeader } from '@/horizon/components/sidebar/sidebar-header';
import { SidebarFooter } from '@/horizon/components/sidebar/sidebar-footer';
import { SidebarItems } from '@/horizon/components/sidebar/sidebar-items';
import { SidebarPositioner } from '@/horizon/components/sidebar/sidebar-positioner';
import { SidebarResponsive } from '@/horizon/components/sidebar/sidebar-responsive';
import { HorizonSidebarCard } from '@/horizon/components/sidebar/horizon-sidebar-card';
import type { RoutesType } from '@/types';

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
      <SidebarHeader>
        <Text fontWeight="bold" fontSize="xl">
          RMF2 Dashboard
        </Text>
      </SidebarHeader>
    </Box>
  ),
};

export const Footer: StoryObj = {
  render: () => (
    <Box w="300px" bg="white" _dark={{ bg: 'navy.800' }} p={4}>
      <SidebarFooter>
        <Text fontSize="sm" color="gray.400">
          v1.0.0 — RMF2 UI
        </Text>
      </SidebarFooter>
    </Box>
  ),
};

export const Content: StoryObj = {
  render: () => (
    <Box w="300px" bg="white" _dark={{ bg: 'navy.800' }}>
      <SidebarContent>
        <Text>Content area children go here.</Text>
      </SidebarContent>
    </Box>
  ),
};

export const Items: StoryObj = {
  render: () => (
    <Box w="300px" bg="white" _dark={{ bg: 'navy.800' }} p={4}>
      <SidebarRoot routes={sampleRoutes}>
        <SidebarItems />
      </SidebarRoot>
    </Box>
  ),
};

export const ItemsActiveRoute: StoryObj = {
  parameters: { initialRoute: '/settings/account' },
  render: () => (
    <Box w="300px" bg="white" _dark={{ bg: 'navy.800' }} p={4}>
      <SidebarRoot routes={sampleRoutes}>
        <SidebarItems />
      </SidebarRoot>
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
      <SidebarRoot routes={sampleRoutes}>
        <SidebarPositioner position="relative" h="600px" display="block">
          <SidebarHeader>
            <Text fontWeight="bold" fontSize="lg">
              RMF2 Dashboard
            </Text>
          </SidebarHeader>
          <SidebarContent>
            <SidebarItems />
          </SidebarContent>
          <SidebarFooter>
            <HorizonSidebarCard />
          </SidebarFooter>
        </SidebarPositioner>
      </SidebarRoot>
    </Box>
  ),
};

export const ResponsiveSidebar: StoryObj = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <SidebarRoot routes={sampleRoutes}>
      <SidebarResponsive>
        <SidebarHeader>
          <Text fontWeight="bold" fontSize="lg">
            RMF2 Dashboard
          </Text>
        </SidebarHeader>
        <SidebarContent>
          <SidebarItems />
        </SidebarContent>
      </SidebarResponsive>
    </SidebarRoot>
  ),
};
