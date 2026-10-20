import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { Card } from '../src/horizon/components/card/card';

const meta = {
  title: 'Horizon/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    backgrounds: { disable: true },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <Box bg={{ base: 'secondaryGray.300', _dark: 'navy.900' }} p={4}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card w="300px">
      <p>Card content goes here</p>
    </Card>
  ),
};

export const CustomPadding: Story = {
  render: () => (
    <Card w="300px" p="40px">
      <p>Card with custom padding</p>
    </Card>
  ),
};
