import { defineSlotRecipe } from '@chakra-ui/react';

export const pendingSlotRecipe = defineSlotRecipe({
  slots: ['spinner'],
  base: {
    spinner: {
      color: 'brand.500',
    },
  },
});
