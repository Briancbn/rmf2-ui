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
    'sidebar.bg': { value: { base: 'white', _dark: '{colors.black}' } },
    'sidebarCard.gradient.from': { value: '{colors.teal.400}' },
    'sidebarCard.gradient.to': { value: '{colors.teal.700}' },
    'sidebarCard.border': {
      value: { base: 'white', _dark: '{colors.teal.900}' },
    },
    'navbar.bg': {
      value: { base: 'rgba(240, 250, 250, 0.9)', _dark: 'rgba(13,38,38,0.9)' },
    },
    'navbar.title': {
      value: { base: '{colors.black}', _dark: '{colors.white}' },
    },
    'navbar.text': { value: { base: 'gray.700', _dark: 'white' } },
    'navbar.menu.bg': { value: { base: 'white', _dark: '{colors.teal.900}' } },
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
    bg: { base: 'gray.50', _dark: 'teal.900' },
  },
  input: {
    color: 'gray.700',
  },
};

export const globalTokens = {
  radii: radiiTokens,
};
