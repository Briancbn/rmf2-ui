import { Box, HStack } from '@chakra-ui/react';
import { useThemeSwitcherSelect } from './use-theme-switcher';

export function ThemeSwitcherSelect() {
  const { themeId, themes, setThemeId } = useThemeSwitcherSelect();

  return (
    <HStack gap={2}>
      {Array.from(themes.values()).map(({ id, colorPreview }) => {
        const isActive = id === themeId;

        const gradient = colorPreview
          ? `conic-gradient(from 120deg, ${colorPreview.brand} 0deg 240deg, ${colorPreview.darkBg} 240deg 300deg, ${colorPreview.bg} 300deg 360deg)`
          : 'conic-gradient(from 120deg, #aaa 0deg 240deg, #444 240deg 300deg, #eee 300deg 360deg)';

        return (
          <Box
            key={id}
            as="button"
            w="28px"
            h="28px"
            borderRadius="full"
            style={{ background: gradient }}
            boxShadow="inset 0 0 0 1.5px rgba(0,0,0,0.25)"
            outline={isActive ? '2.5px solid' : '2.5px solid transparent'}
            outlineColor={isActive ? 'brand.500' : 'transparent'}
            outlineOffset="2px"
            cursor="pointer"
            transition="transform 0.15s"
            _hover={{ transform: 'scale(1.1)' }}
            _focusVisible={{ outline: 'none' }}
            aria-label={`Switch to ${id} theme`}
            aria-pressed={isActive}
            onClick={() => setThemeId(id)}
          />
        );
      })}
    </HStack>
  );
}
