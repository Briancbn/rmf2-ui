import { defineSlotRecipe } from '@chakra-ui/react';

export const navbarRecipe = defineSlotRecipe({
  slots: ['root', 'toolbar'],
  base: {
    root: {
      bg: 'navbar.bg',
      borderBottomColor: { base: 'teal.500', _dark: 'teal.500' },
      borderBottomWidth: '0.5px',
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
