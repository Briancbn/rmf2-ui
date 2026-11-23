import { defineSlotRecipe } from '@chakra-ui/react';

export const schedulerViewerSlotRecipe = defineSlotRecipe({
  slots: ['ganttItem'],
  base: {
    ganttItem: {
      color: { base: 'gray.800', _dark: 'white' },
      cursor: 'pointer',
    },
  },
});
