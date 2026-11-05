import { defineSlotRecipe } from '@chakra-ui/react';

export const bannerRecipe = defineSlotRecipe({
  slots: ['button'],
  base: {
    button: {
      bg: 'orange.400',
      color: 'black',
      _hover: { bg: 'whiteAlpha.900' },
      _active: { bg: 'blue.200' },
      _focus: { bg: 'white' },
    },
  },
});
