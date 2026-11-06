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

export const semanticTokens = {
  colors: {
    'sidebar.bg': {
      value: { base: '{colors.white}', _dark: '{colors.black}' },
    },
    'sidebarCard.gradient.from': { value: '{colors.teal.400}' },
    'sidebarCard.gradient.to': { value: '{colors.teal.700}' },
    'sidebarCard.border': {
      value: { base: '{colors.white}', _dark: '{colors.teal.900}' },
    },
    'navbar.bg': {
      value: { base: 'rgba(255, 255, 255, 0.5)', _dark: '{colors.black}' },
    },
    'navbar.title': {
      value: { base: '{colors.black}', _dark: '{colors.white}' },
    },
    'navbar.text': { value: { base: 'gray.700', _dark: 'white' } },
    'navbar.menu.bg': {
      value: { base: 'white', _dark: '{colors.gray.900}' },
    },
    'banner.gradient.from': { value: '{colors.teal.600}' },
    'banner.gradient.to': { value: '{colors.teal.100}' },
    'banner.button.bg': { value: '{colors.orange.400}' },
    'banner.button.color': { value: '{colors.black}' },
    'banner.button.hover.bg': { value: '{colors.whiteAlpha.900}' },
  },
  shadows: {
    'navbar.toolbar': {
      value: {
        base: '14px 17px 40px 4px rgba(0, 128, 128, 0.12)',
        _dark: '14px 17px 40px 4px rgba(0, 128, 128, 0.06)',
      },
    },
  },
};

export const globalCss = {
  'html,body': {
    overflowX: 'hidden',
    fontFamily: 'Open Sans',
    letterSpacing: '-0.5px',
    bg: { base: 'white', _dark: 'black' },
  },
  input: {
    color: 'gray.700',
  },
};

export const globalTokens = {
  colors: colorTokens,
  radii: radiiTokens,
};
