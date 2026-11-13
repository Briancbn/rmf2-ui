import { defineSlotRecipe } from '@chakra-ui/react';

export const sidebarRecipe = defineSlotRecipe({
  slots: ['positioner', 'itemRoot', 'itemIcon', 'itemLabel', 'itemIndicator'],
  base: {
    positioner: {
      bg: 'sidebar.bg',
      boxShadow: '14px 17px 40px 4px rgba(0, 128, 128, 0.08)',
    },
    itemRoot: {
      _hover: { bg: { base: 'blackAlpha.50', _dark: 'whiteAlpha.100' } },
    },
  },
  variants: {
    active: {
      true: {
        itemIcon: { color: { base: 'teal.500', _dark: 'teal.200' } },
        itemLabel: {
          color: { base: 'teal.900', _dark: 'teal.100' },
          fontWeight: 'bold',
        },
        itemIndicator: { bg: { base: 'teal.500', _dark: 'teal.400' } },
      },
      false: {
        itemIcon: { color: { base: 'gray.500', _dark: 'teal.600' } },
        itemLabel: { color: { base: 'gray.500', _dark: 'gray.400' } },
        itemIndicator: { bg: 'transparent' },
      },
    },
  },
  defaultVariants: { active: false },
});
