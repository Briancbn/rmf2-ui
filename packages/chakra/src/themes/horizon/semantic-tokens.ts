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
    'schedule-viewer.gantt.preset1.bg': {
      value: { base: '{colors.green.300}', _dark: '{colors.green.700}' },
    },
    'schedule-viewer.gantt.preset2.bg': {
      value: { base: '{colors.purple.300}', _dark: '{colors.purple.700}' },
    },
    'schedule-viewer.gantt.preset3.bg': {
      value: { base: '{colors.orange.200}', _dark: '{colors.orange.500}' },
    },
    'schedule-viewer.gantt.preset4.bg': {
      value: { base: '{colors.pink.300}', _dark: '{colors.pink.600}' },
    },
    'schedule-viewer.gantt.preset5.bg': {
      value: { base: '{colors.cyan.300}', _dark: '{colors.teal.700}' },
    },
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
