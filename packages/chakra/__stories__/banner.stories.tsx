import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import {
  BannerRoot,
  BannerHeader,
  BannerContent,
  BannerButton,
} from '../src/horizon/components/banner/banner';

const meta = {
  title: 'Horizon/Banner',
  tags: ['autodocs'],
  parameters: {
    backgrounds: { disable: true },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <Box bg={{ base: 'secondaryGray.300', _dark: 'navy.900' }} p={6}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta;

export default meta;

export const Default: StoryObj = {
  render: () => (
    <BannerRoot>
      <BannerHeader>Welcome to RMF2</BannerHeader>
      <BannerContent>
        <span style={{ color: 'white' }}>
          Manage your robot fleet from one place.
        </span>
        <BannerButton>Get Started</BannerButton>
      </BannerContent>
    </BannerRoot>
  ),
};

export const CustomColorPalette: StoryObj = {
  render: () => (
    <BannerRoot colorPalette="blue">
      <BannerHeader>Custom Color</BannerHeader>
      <BannerContent>
        <BannerButton>Learn More</BannerButton>
      </BannerContent>
    </BannerRoot>
  ),
};

export const HeaderOnly: StoryObj = {
  render: () => (
    <BannerRoot>
      <BannerHeader>Header Only Banner</BannerHeader>
    </BannerRoot>
  ),
};

export const WithoutButton: StoryObj = {
  render: () => (
    <BannerRoot>
      <BannerHeader>Informational Banner</BannerHeader>
      <BannerContent>
        <span style={{ color: 'white' }}>
          This banner has no action button.
        </span>
      </BannerContent>
    </BannerRoot>
  ),
};
