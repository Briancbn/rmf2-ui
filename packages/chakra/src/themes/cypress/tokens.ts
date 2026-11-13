const colorTokens = {
  brand: {
    50: { value: '{colors.teal.50}' },
    100: { value: '{colors.teal.100}' },
    200: { value: '{colors.teal.200}' },
    300: { value: '{colors.teal.300}' },
    400: { value: '{colors.teal.400}' },
    500: { value: '{colors.teal.500}' },
    600: { value: '{colors.teal.600}' },
    700: { value: '{colors.teal.700}' },
    800: { value: '{colors.teal.800}' },
    900: { value: '{colors.teal.900}' },
  },
};

const radiiTokens = {
  none: { value: '0' },
  sm: { value: '0.125rem' },
  base: { value: '0.25rem' },
  md: { value: '0.375rem' },
  lg: { value: '0.5rem' },
  xl: { value: '0.75rem' },
  '2xl': { value: '1rem' },
  '3xl': { value: '1.5rem' },
  full: { value: '9999px' },
};

export const globalTokens = {
  colors: colorTokens,
  radii: radiiTokens,
};
