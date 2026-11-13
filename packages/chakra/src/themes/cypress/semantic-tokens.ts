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
