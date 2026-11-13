import { Button } from '@chakra-ui/react';
import type { ButtonProps } from '@chakra-ui/react';
import { useThemeSwitcherButton } from './use-theme-switcher';

export interface ThemeSwitcherButtonProps
  extends Omit<ButtonProps, 'onClick'> {}

export function ThemeSwitcherButton(props: ThemeSwitcherButtonProps) {
  const { themeId, themes, setThemeId } = useThemeSwitcherButton();
  const current = themes.get(themeId);

  const handleClick = () => {
    const keys = Array.from(themes.keys());
    const idx = keys.indexOf(themeId);
    setThemeId(keys[(idx + 1) % keys.length]);
  };

  return (
    <Button type="button" onClick={handleClick} {...props}>
      {current?.label ?? themeId}
    </Button>
  );
}
