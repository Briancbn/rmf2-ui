import { defineSlotRecipe } from '@chakra-ui/react';

export const sidebarRecipe = defineSlotRecipe({
  slots: ['positioner', 'itemRoot', 'itemIcon', 'itemLabel', 'itemIndicator'],
  base: {
    positioner: {
      bg: { base: 'white', _dark: 'navy.800' },
      boxShadow: {
        base: '14px 17px 40px 4px rgba(112, 144, 176, 0.08)',
        _dark: 'unset',
      },
    },
    itemRoot: {
      _hover: { bg: { base: 'blackAlpha.50', _dark: 'whiteAlpha.100' } },
    },
  },
  variants: {
    active: {
      true: {
        itemIcon: { color: { base: 'brand.500', _dark: 'white' } },
        itemLabel: {
          color: { base: 'gray.700', _dark: 'white' },
          fontWeight: 'bold',
        },
        itemIndicator: { bg: { base: 'brand.500', _dark: 'brand.400' } },
      },
      false: {
        itemIcon: {
          color: { base: 'secondaryGray.500', _dark: 'secondaryGray.600' },
        },
        itemLabel: {
          color: { base: 'secondaryGray.500', _dark: 'secondaryGray.600' },
        },
        itemIndicator: { bg: 'transparent' },
      },
    },
  },
  defaultVariants: { active: false },
});
