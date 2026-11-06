import { Icon, Switch } from '@chakra-ui/react';
import { FaMoon, FaSun } from 'react-icons/fa6';
import { useThemeSwitcher } from './use-theme-switcher';

// Fixed hex colors so the switch icons look consistent regardless of active theme
const SUN_COLOR = '#ecc94b'; // yellow-400
const MOON_COLOR = '#e2e8f0'; // gray-200

export function ThemeSwitcherColorModeSwitch(
  props: Omit<Switch.RootProps, 'children'>,
) {
  const ctx = useThemeSwitcher();
  const colorMode = ctx?.colorMode;
  const setColorMode = ctx?.setColorMode;
  const themeColors = ctx ? ctx.themeColors[ctx.themeId] : undefined;

  if (!ctx || !colorMode || !setColorMode) return null;

  // Fixed hex so the thumb preview color is stable across theme token changes
  const lightBg = themeColors?.bg ?? '#ffffff';
  const darkBg = themeColors?.darkBg ?? '#000000';

  return (
    <Switch.Root
      checked={colorMode === 'dark'}
      onCheckedChange={(e) => setColorMode(e.checked ? 'dark' : 'light')}
      aria-label="Toggle color mode"
      css={{
        '--switch-width': '70px',
        '--switch-height': '36px',
      }}
      {...props}
    >
      <Switch.HiddenInput />
      <Switch.Control bg="brand.600" _checked={{ bg: 'brand.500' }}>
        <Switch.Thumb bg={colorMode === 'dark' ? darkBg : lightBg} />
        <Switch.Indicator
          fallback={
            <Icon
              as={FaSun}
              style={{ width: '20px', height: '20px', color: SUN_COLOR }}
            />
          }
        >
          <Icon
            as={FaMoon}
            style={{ width: '20px', height: '20px', color: MOON_COLOR }}
          />
        </Switch.Indicator>
      </Switch.Control>
    </Switch.Root>
  );
}
