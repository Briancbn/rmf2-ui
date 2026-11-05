import { useThemeSwitcher } from './use-theme-switcher';

export interface ThemeSwitcherButtonProps {
  label?: (themeId: string) => string;
}

export function ThemeSwitcherButton({
  label = (id) => `Theme: ${id}`,
}: ThemeSwitcherButtonProps) {
  const ctx = useThemeSwitcher();
  if (!ctx) return null;

  const { themeId, availableThemes, setThemeId } = ctx;

  const handleClick = () => {
    const idx = availableThemes.indexOf(themeId);
    setThemeId(availableThemes[(idx + 1) % availableThemes.length]);
  };

  return (
    <button type="button" onClick={handleClick}>
      {label(themeId)}
    </button>
  );
}
