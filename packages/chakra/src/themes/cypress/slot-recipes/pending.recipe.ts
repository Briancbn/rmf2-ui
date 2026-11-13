import { defineSlotRecipe } from '@chakra-ui/react';

export const pendingRecipe = defineSlotRecipe({
  slots: ['spinner'],
  base: {
    spinner: {
      color: 'teal.500',
    },
  },
});
