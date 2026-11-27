/**
 * Maps each preset key to its resolved CSS variable color.
 *
 * Values use the `var(--chakra-colors-...)` format so they can be used
 * directly in inline styles (e.g. React Flow node colors) and in
 * `color-mix()` expressions where Chakra token references are not supported.
 */
export const PRESET_COLOR_MAP: Record<string, string> = {
  preset_1: 'var(--chakra-colors-schedule-viewer\\.preset1\\.bg)',
  preset_2: 'var(--chakra-colors-schedule-viewer\\.preset2\\.bg)',
  preset_3: 'var(--chakra-colors-schedule-viewer\\.preset3\\.bg)',
  preset_4: 'var(--chakra-colors-schedule-viewer\\.preset4\\.bg)',
  preset_5: 'var(--chakra-colors-schedule-viewer\\.preset5\\.bg)',
};

/**
 * Assigns a preset key from `PRESET_COLOR_MAP` to each new category,
 * cycling through available presets when all are used.
 *
 * @param categories - Categories that may need a preset assigned.
 * @param existing - Current `category -> presetKey` mapping to extend.
 * @returns Updated mapping with new categories filled in.
 */
export function assignPresets(
  categories: string[],
  existing: Record<string, string>,
): Record<string, string> {
  const presetKeys = Object.keys(PRESET_COLOR_MAP);
  const updated = { ...existing };
  let nextIndex = Object.keys(updated).length;
  for (const category of categories) {
    if (updated[category] === undefined) {
      updated[category] =
        presetKeys[nextIndex % presetKeys.length] ?? presetKeys[0];
      nextIndex++;
    }
  }
  return updated;
}

/**
 * Returns the CSS variable color string for a given preset key,
 * or `undefined` if the key is not in `PRESET_COLOR_MAP`.
 *
 * @param presetKey - A key from `PRESET_COLOR_MAP` (e.g. `preset_1`).
 */
export function getPresetColor(presetKey: string): string | undefined {
  return PRESET_COLOR_MAP[presetKey];
}
