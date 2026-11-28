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
    bg: { base: 'white', _dark: 'whiteAlpha.200' },
    borderColor: { _dark: 'whiteAlpha.100' },
    borderWidth: '0.5px',
    backgroundClip: 'border-box',
  },
});
