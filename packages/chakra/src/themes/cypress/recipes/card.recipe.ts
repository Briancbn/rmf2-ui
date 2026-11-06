import { defineRecipe } from '@chakra-ui/react';

export const cardRecipe = defineRecipe({
  base: {
    p: '20px',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    position: 'relative',
    borderRadius: '20px',
    minWidth: '0px',
    wordWrap: 'break-word',
    bg: { base: 'white', _dark: 'teal.800' },
    backgroundClip: 'border-box',
  },
});
