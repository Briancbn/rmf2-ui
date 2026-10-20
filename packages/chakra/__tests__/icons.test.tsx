import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from './utils';
import { Icon } from '@chakra-ui/react';
import {
  HorizonLogo,
  HomeIcon,
  SettingsIcon,
  ProfileIcon,
  WalletIcon,
  RocketIcon,
  CartIcon,
  ClockIcon,
  DocumentIcon,
  GlobeIcon,
} from '@/horizon/components/icons/icons';

const icons = [
  HorizonLogo,
  HomeIcon,
  SettingsIcon,
  ProfileIcon,
  WalletIcon,
  RocketIcon,
  CartIcon,
  ClockIcon,
  DocumentIcon,
  GlobeIcon,
];

describe('Horizon Icons', () => {
  icons.forEach((IconComponent) => {
    it(`renders ${IconComponent.displayName ?? 'icon'} without crashing`, () => {
      const { container } = render(<Icon as={IconComponent} w={6} h={6} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  it('renders an svg element', () => {
    const { container } = render(<Icon as={HorizonLogo} w={8} h={8} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
