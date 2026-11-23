import { defineSlotRecipe } from '@chakra-ui/react';

export const schedulerViewerSlotRecipe = defineSlotRecipe({
  slots: ['gantt.selected'],
  base: {
    'gantt.selected': {
      borderColor: 'white',
      borderWidth: '1px',
      boxShadow: '0 0 10px gray',
      filter: 'brightness(1.2)',
    },
  },
});
