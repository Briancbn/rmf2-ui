import { Box } from '@chakra-ui/react';
import { Card } from '@rmf2-ui/chakra';
import { ColorModeButton } from '@/components/ui/color-mode';

export function Home() {
  return (
    <Box>
      <Card>
        <ColorModeButton />
      </Card>
    </Box>
  );
}
