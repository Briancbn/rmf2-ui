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
    'schedule-viewer.preset1.bg': {
      value: { base: '{colors.brand.200}', _dark: '{colors.brand.700}' },
    },
    'schedule-viewer.preset2.bg': {
      value: { base: '#FF9AE8', _dark: '#66004E' },
    },
    'schedule-viewer.preset3.bg': {
      value: { base: '#FF9DBE', _dark: '#610020' },
    },
    'schedule-viewer.preset4.bg': {
      value: { base: '#FFB291', _dark: '#702200' },
    },
    'schedule-viewer.preset5.bg': {
      value: { base: '#FFD470', _dark: '#8F6400' },
    },
    'schedule-viewer.gantt.item.text': {
      value: { base: '{colors.gray.900}', _dark: '{colors.white}' },
    },
    'schedule-viewer.gantt.axis.text': {
      value: { base: '{colors.gray.700}', _dark: '{colors.white}' },
    },
    'schedule-viewer.gantt.label.text': {
      value: { base: '{colors.gray.700}', _dark: '{colors.white}' },
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
