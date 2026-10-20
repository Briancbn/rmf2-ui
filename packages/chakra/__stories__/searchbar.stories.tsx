import type { Meta, StoryObj } from '@storybook/react';
import { Searchbar } from '../src/horizon/components/searchbar/searchbar';

const meta = {
  title: 'Horizon/Searchbar',
  component: Searchbar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Searchbar>;

export default meta;
type Story = StoryObj<typeof Searchbar>;

export const Default: Story = {};

export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Search components...',
  },
};

export const Wide: Story = {
  args: {
    w: '400px',
    placeholder: 'Search...',
  },
};
