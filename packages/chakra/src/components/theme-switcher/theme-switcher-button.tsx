import { Button } from '@chakra-ui/react';
import type { ButtonProps } from '@chakra-ui/react';
import { useThemeSwitcher } from './use-theme-switcher';

export interface ThemeSwitcherButtonProps extends Omit<ButtonProps, 'onClick'> {
  label?: (themeId: string) => string;
}

export function ThemeSwitcherButton({
  label = (id) => `${id}`,
  ...rest
}: ThemeSwitcherButtonProps) {
  const ctx = useThemeSwitcher();
  if (!ctx) return null;

  const { themeId, availableThemes, setThemeId } = ctx;

  const handleClick = () => {
    const idx = availableThemes.indexOf(themeId);
    setThemeId(availableThemes[(idx + 1) % availableThemes.length]);
  };

  return (
    <Button type="button" onClick={handleClick} {...rest}>
      {label(themeId)}
    </Button>
  );
}
