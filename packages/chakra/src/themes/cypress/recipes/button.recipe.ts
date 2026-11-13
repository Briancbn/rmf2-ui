import { defineRecipe } from '@chakra-ui/react';

export const buttonRecipe = defineRecipe({
  base: {
    borderRadius: '16px',
    boxShadow: '45px 76px 113px 7px rgba(0, 128, 128, 0.08)',
    transition: '.25s all ease',
    boxSizing: 'border-box',
    _focus: { boxShadow: 'none' },
    _active: { boxShadow: 'none' },
  },
  variants: {
    variant: {
      outline: {
        borderRadius: '16px',
      },
      brand: {
        bg: { base: 'teal.600', _dark: 'teal.700' },
        color: 'white',
        _focus: { bg: { base: 'teal.400', _dark: 'teal.400' } },
        _active: { bg: { base: 'teal.400', _dark: 'teal.400' } },
        _hover: { bg: { base: 'teal.400', _dark: 'teal.400' } },
      },
      darkBrand: {
        bg: { base: 'teal.900', _dark: 'teal.400' },
        color: 'white',
        _focus: { bg: { base: 'teal.900', _dark: 'teal.400' } },
        _active: { bg: { base: 'teal.900', _dark: 'teal.400' } },
        _hover: { bg: { base: 'teal.800', _dark: 'teal.400' } },
      },
      lightBrand: {
        bg: { base: 'teal.50', _dark: 'whiteAlpha.100' },
        color: { base: 'teal.500', _dark: 'white' },
        _focus: { bg: { base: 'teal.50', _dark: 'whiteAlpha.100' } },
        _active: { bg: { base: 'gray.100', _dark: 'whiteAlpha.100' } },
        _hover: { bg: { base: 'gray.200', _dark: 'whiteAlpha.200' } },
      },
      light: {
        bg: { base: 'gray.100', _dark: 'whiteAlpha.100' },
        color: { base: 'gray.900', _dark: 'white' },
        _focus: { bg: { base: 'gray.100', _dark: 'whiteAlpha.100' } },
        _active: { bg: { base: 'gray.100', _dark: 'whiteAlpha.100' } },
        _hover: { bg: { base: 'gray.200', _dark: 'whiteAlpha.200' } },
      },
      action: {
        fontWeight: '500',
        borderRadius: '50px',
        bg: { base: 'gray.100', _dark: 'teal.400' },
        color: { base: 'teal.500', _dark: 'white' },
        _focus: { bg: { base: 'gray.100', _dark: 'teal.400' } },
        _active: { bg: { base: 'gray.100', _dark: 'teal.400' } },
        _hover: { bg: { base: 'gray.200', _dark: 'teal.400' } },
      },
      setup: {
        fontWeight: '500',
        borderRadius: '50px',
        bg: { base: 'transparent', _dark: 'teal.400' },
        border: { base: '1px solid', _dark: '0px solid' },
        borderColor: { base: 'gray.300', _dark: 'transparent' },
        color: { base: 'gray.900', _dark: 'white' },
        _focus: { bg: { base: 'transparent', _dark: 'teal.400' } },
        _active: { bg: { base: 'transparent', _dark: 'teal.400' } },
        _hover: { bg: { base: 'gray.50', _dark: 'teal.400' } },
      },
    },
  },
});
