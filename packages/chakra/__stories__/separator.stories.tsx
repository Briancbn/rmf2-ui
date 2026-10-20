import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  HSeparator,
  VSeparator,
} from '../src/horizon/components/separator/separator';

const meta = {
  title: 'Horizon/Separator',
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

export const Horizontal: StoryObj = {
  render: () => <HSeparator />,
};

export const Vertical: StoryObj = {
  render: () => <VSeparator h="100px" />,
};

export const HorizontalCustomColor: StoryObj = {
  render: () => <HSeparator bg="blue.400" />,
};
