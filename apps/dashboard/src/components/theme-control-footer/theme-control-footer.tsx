import { HStack } from '@chakra-ui/react';
import { ThemeSwitcher } from '@rmf2-ui/chakra';

// Must be rendered inside ThemeSwitcher.Root
export function ThemeControlFooter() {
  return (
    <HStack gap="10px" w="full" justify="flex-start" p="12px">
      <ThemeSwitcher.ColorModeSwitch />
      <ThemeSwitcher.Select />
    </HStack>
  );
}
