import { defineSlotRecipe } from '@chakra-ui/react';

export const bannerRecipe = defineSlotRecipe({
  slots: ['button'],
  base: {
    button: {
      bg: 'banner.button.bg',
      color: 'banner.button.color',
      _hover: { bg: 'banner.button.hover.bg' },
      _active: { bg: 'banner.button.bg' },
      _focus: { bg: 'white' },
    },
  },
});
