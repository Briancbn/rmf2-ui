import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { Banner } from '../src/horizon/components/banner';

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
    <Banner.Root
      bgGradient="to-b"
      gradientFrom="brand.800"
      gradientTo="brand.100"
    >
      <Banner.Header>Step into the Creative World of Simulation</Banner.Header>
      <Banner.Content>
        <Banner.Button
          onClick={() => setSimStarted(true)}
          disabled={simStarted}
          bg="white"
          _hover={{ bg: 'whiteAlpha.800' }}
        >
          Start Simulation
        </Banner.Button>
        <Banner.Button
          onClick={() => setSimStarted(false)}
          disabled={!simStarted}
          bg="white"
          _hover={{ bg: 'whiteAlpha.800' }}
        >
          Stop Simulation
        </Banner.Button>
      </Banner.Content>
    </Banner.Root>
  );
}

export const SimulationControl: StoryObj = {
  render: () => <SimulationControlBanner />,
};

export const DefaultGradient: StoryObj = {
  render: () => (
    <Banner.Root>
      <Banner.Header>Welcome to RMF2</Banner.Header>
      <Banner.Content>
        <Banner.Button>Get Started</Banner.Button>
      </Banner.Content>
    </Banner.Root>
  ),
};

export const CustomColorPalette: StoryObj = {
  render: () => (
    <Banner.Root colorPalette="blue">
      <Banner.Header>Custom Color Palette</Banner.Header>
      <Banner.Content>
        <Banner.Button>Learn More</Banner.Button>
      </Banner.Content>
    </Banner.Root>
  ),
};
