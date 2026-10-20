import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Grid, Text, Flex, Icon } from '@chakra-ui/react';
import {
  AdobexdLogo,
  AppleLogo,
  AndroidLogo,
  WindowsLogo,
  AtlassianLogo,
  CartIcon,
  ClockIcon,
  CreditIcon,
  DashboardLogo,
  DashboardLogoWhite,
  DocumentIcon,
  GlobeIcon,
  HelpIcon,
  HomeIcon,
  InvisionLogo,
  JiraLogo,
  MastercardIcon,
  PayPalIcon,
  PersonIcon,
  ProfileIcon,
  RocketIcon,
  SettingsIcon,
  SlackLogo,
  SpotifyLogo,
  HorizonLogo,
  SupportIcon,
  StatsIcon,
  WalletIcon,
  VisaIcon,
  BitcoinLogo,
  EthereumLogoOutline,
  DashCurveUp,
  DashCurveDown,
  ButtonLeft,
  ButtonRight,
  Fingerprint,
} from '../src/horizon/components/icons/icons';

const ALL_ICONS = [
  { name: 'AdobexdLogo', icon: AdobexdLogo },
  { name: 'AppleLogo', icon: AppleLogo },
  { name: 'AndroidLogo', icon: AndroidLogo },
  { name: 'WindowsLogo', icon: WindowsLogo },
  { name: 'AtlassianLogo', icon: AtlassianLogo },
  { name: 'CartIcon', icon: CartIcon },
  { name: 'ClockIcon', icon: ClockIcon },
  { name: 'CreditIcon', icon: CreditIcon },
  { name: 'DashboardLogo', icon: DashboardLogo },
  { name: 'DashboardLogoWhite', icon: DashboardLogoWhite },
  { name: 'DocumentIcon', icon: DocumentIcon },
  { name: 'GlobeIcon', icon: GlobeIcon },
  { name: 'HelpIcon', icon: HelpIcon },
  { name: 'HomeIcon', icon: HomeIcon },
  { name: 'InvisionLogo', icon: InvisionLogo },
  { name: 'JiraLogo', icon: JiraLogo },
  { name: 'MastercardIcon', icon: MastercardIcon },
  { name: 'PayPalIcon', icon: PayPalIcon },
  { name: 'PersonIcon', icon: PersonIcon },
  { name: 'ProfileIcon', icon: ProfileIcon },
  { name: 'RocketIcon', icon: RocketIcon },
  { name: 'SettingsIcon', icon: SettingsIcon },
  { name: 'SlackLogo', icon: SlackLogo },
  { name: 'SpotifyLogo', icon: SpotifyLogo },
  { name: 'HorizonLogo', icon: HorizonLogo },
  { name: 'SupportIcon', icon: SupportIcon },
  { name: 'StatsIcon', icon: StatsIcon },
  { name: 'WalletIcon', icon: WalletIcon },
  { name: 'VisaIcon', icon: VisaIcon },
  { name: 'BitcoinLogo', icon: BitcoinLogo },
  { name: 'EthereumLogoOutline', icon: EthereumLogoOutline },
  { name: 'DashCurveUp', icon: DashCurveUp },
  { name: 'DashCurveDown', icon: DashCurveDown },
  { name: 'ButtonLeft', icon: ButtonLeft },
  { name: 'ButtonRight', icon: ButtonRight },
  { name: 'Fingerprint', icon: Fingerprint },
] as const;

const meta = {
  title: 'Horizon/Icons',
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

export const AllIcons: StoryObj = {
  render: () => (
    <Grid templateColumns="repeat(auto-fill, minmax(120px, 1fr))" gap={4}>
      {ALL_ICONS.map(({ name, icon: IconComponent }) => (
        <Flex
          key={name}
          direction="column"
          align="center"
          gap={2}
          p={3}
          borderRadius="md"
          border="1px solid"
          borderColor="gray.200"
        >
          <Icon as={IconComponent} w={8} h={8} />
          <Text fontSize="xs" textAlign="center" wordBreak="break-word">
            {name}
          </Text>
        </Flex>
      ))}
    </Grid>
  ),
};

export const SingleIcon: StoryObj = {
  render: () => <Icon as={HorizonLogo} w={12} h={12} />,
};
