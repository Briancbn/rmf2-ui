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
    'schedule-viewer.gantt.preset1.bg': {
      value: { base: '{colors.green.300}', _dark: '{colors.green.700}' },
    },
    'schedule-viewer.gantt.preset2.bg': {
      value: { base: '{colors.purple.300}', _dark: '{colors.purple.700}' },
    },
    'schedule-viewer.gantt.preset3.bg': {
      value: { base: '{colors.orange.200}', _dark: '{colors.orange.700}' },
    },
    'schedule-viewer.gantt.preset4.bg': {
      value: { base: '{colors.pink.300}', _dark: '{colors.pink.700}' },
    },
    'schedule-viewer.gantt.preset5.bg': {
      value: { base: '{colors.cyan.300}', _dark: '{colors.teal.700}' },
    },
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
