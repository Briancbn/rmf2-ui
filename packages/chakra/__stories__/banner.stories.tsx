import React, { useState } from 'react';
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

function SimulationControlBanner() {
  const [simStarted, setSimStarted] = useState(false);
  return (
    <BannerRoot
      bgGradient="to-b"
      gradientFrom="brand.800"
      gradientTo="brand.100"
    >
      <BannerHeader>Step into the Creative World of Simulation</BannerHeader>
      <BannerContent>
        <BannerButton
          onClick={() => setSimStarted(true)}
          disabled={simStarted}
          bg="white"
          _hover={{ bg: 'whiteAlpha.800' }}
        >
          Start Simulation
        </BannerButton>
        <BannerButton
          onClick={() => setSimStarted(false)}
          disabled={!simStarted}
          bg="white"
          _hover={{ bg: 'whiteAlpha.800' }}
        >
          Stop Simulation
        </BannerButton>
      </BannerContent>
    </BannerRoot>
  );
}

export const SimulationControl: StoryObj = {
  render: () => <SimulationControlBanner />,
};

export const DefaultGradient: StoryObj = {
  render: () => (
    <BannerRoot>
      <BannerHeader>Welcome to RMF2</BannerHeader>
      <BannerContent>
        <BannerButton>Get Started</BannerButton>
      </BannerContent>
    </BannerRoot>
  ),
};

export const CustomColorPalette: StoryObj = {
  render: () => (
    <BannerRoot colorPalette="blue">
      <BannerHeader>Custom Color Palette</BannerHeader>
      <BannerContent>
        <BannerButton>Learn More</BannerButton>
      </BannerContent>
    </BannerRoot>
  ),
};
