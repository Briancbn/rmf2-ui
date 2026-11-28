import { defineSlotRecipe } from '@chakra-ui/react';

export const navbarSlotRecipe = defineSlotRecipe({
  slots: ['root', 'toolbar'],
  base: {
    root: {
      bg: 'navbar.bg',
      borderRadius: '16px',
      borderColor: 'transparent',
      borderWidth: '1.5px',
      borderStyle: 'solid',
      boxShadow: 'none',
    },
    toolbar: {
      bg: 'navbar.menu.bg',
      borderRadius: '30px',
      boxShadow: 'navbar.toolbar',
    },
  },
});
