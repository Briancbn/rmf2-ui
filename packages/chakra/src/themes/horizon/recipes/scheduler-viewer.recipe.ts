import { defineSlotRecipe } from '@chakra-ui/react';

const PRESETS = [1, 2, 3, 4, 5] as const;

function presetSelectedSlot(n: number) {
  return {
    [`gantt.selected.preset_${n}`]: {
      '--gantt-selected-border-color': {
        base: `color-mix(in srgb, var(--gantt-preset-${n}-bg) 70%, black)`,
        _dark: `color-mix(in srgb, var(--gantt-preset-${n}-bg) 70%, white)`,
      },
      '--gantt-selected-border-width': '2px',
      boxShadow: `0 0 8px 2px color-mix(in srgb, var(--gantt-preset-${n}-bg) 60%, transparent)`,
      filter: { base: 'brightness(0.9)', _dark: 'brightness(1.3)' },
    },
  };
}

export const schedulerViewerSlotRecipe = defineSlotRecipe({
  slots: PRESETS.map((n) => `gantt.selected.preset_${n}`),
  base: Object.assign({}, ...PRESETS.map(presetSelectedSlot)),
});
