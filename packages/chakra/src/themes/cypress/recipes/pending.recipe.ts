import { defineSlotRecipe } from '@chakra-ui/react';

export const pendingSlotRecipe = defineSlotRecipe({
  slots: ['spinner'],
  base: {
    spinner: {
      color: 'teal.500',
    },
  },
});
