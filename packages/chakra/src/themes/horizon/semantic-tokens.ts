export const semanticTokens = {
  colors: {
    'navbar.bg': {
      value: { base: 'rgba(244, 247, 254, 0.9)', _dark: 'rgba(11,20,55,0.9)' },
    },
    'navbar.title': {
      value: { base: '{colors.navy.700}', _dark: '{colors.white}' },
    },
    'navbar.text': { value: { base: 'gray.700', _dark: 'white' } },
    'navbar.menu.bg': { value: { base: 'white', _dark: '{colors.navy.800}' } },
    'sidebar.bg': { value: { base: 'white', _dark: '{colors.navy.800}' } },
    'sidebarCard.gradient.from': { value: '#868CFF' },
    'sidebarCard.gradient.to': { value: '#4318FF' },
    'sidebarCard.border': {
      value: { base: 'white', _dark: '{colors.navy.800}' },
    },
    'banner.gradient.from': { value: '{colors.brand.600}' },
    'banner.gradient.to': { value: '{colors.brand.100}' },
    'banner.button.bg': { value: '{colors.orange.400}' },
    'banner.button.color': { value: '{colors.black}' },
    'banner.button.hover.bg': { value: '{colors.whiteAlpha.900}' },
  },
  shadows: {
    'navbar.toolbar': {
      value: {
        base: '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
        _dark: '14px 17px 40px 4px rgba(112, 144, 176, 0.06)',
      },
    },
  },
};
