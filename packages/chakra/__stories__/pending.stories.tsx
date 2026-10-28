import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { Pending } from '../src/horizon/components/pending';

const meta = {
  title: 'Horizon/Pending',
  tags: ['autodocs'],
  parameters: {
    backgrounds: { disable: true },
  },
} satisfies Meta;

export default meta;

export const SpinnerOnly: StoryObj = {
  render: () => (
    <Box position="relative" w="200px" h="200px" bg="gray.100">
      <Pending.Root>
        <Pending.Spinner />
      </Pending.Root>
    </Box>
  ),
};

export const WithOverlay: StoryObj = {
  render: () => (
    <Box
      position="relative"
      w="300px"
      h="200px"
      bg="gray.100"
      borderRadius="md"
      overflow="hidden"
    >
      <Box p={4}>
        <p>Content underneath the overlay</p>
      </Box>
      <Pending.Root>
        <Pending.Overlay />
        <Pending.Spinner />
      </Pending.Root>
    </Box>
  ),
};

export const SmallSpinner: StoryObj = {
  render: () => (
    <Box position="relative" w="100px" h="100px" bg="gray.100">
      <Pending.Root>
        <Pending.Spinner size="sm" />
      </Pending.Root>
    </Box>
  ),
};

export const LargeSpinner: StoryObj = {
  render: () => (
    <Box position="relative" w="300px" h="300px" bg="gray.100">
      <Pending.Root>
        <Pending.Spinner size="xl" />
      </Pending.Root>
    </Box>
  ),
};
