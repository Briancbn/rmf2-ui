import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import {
  PendingRoot,
  PendingOverlay,
  PendingSpinner,
} from '../src/horizon/components/pending/pending';

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
      <PendingRoot>
        <PendingSpinner />
      </PendingRoot>
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
      <PendingRoot>
        <PendingOverlay />
        <PendingSpinner />
      </PendingRoot>
    </Box>
  ),
};

export const SmallSpinner: StoryObj = {
  render: () => (
    <Box position="relative" w="100px" h="100px" bg="gray.100">
      <PendingRoot>
        <PendingSpinner size="sm" />
      </PendingRoot>
    </Box>
  ),
};

export const LargeSpinner: StoryObj = {
  render: () => (
    <Box position="relative" w="300px" h="300px" bg="gray.100">
      <PendingRoot>
        <PendingSpinner size="xl" />
      </PendingRoot>
    </Box>
  ),
};
