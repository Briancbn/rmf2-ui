import { Box } from '@chakra-ui/react';
import { Horizon } from '@rmf2-ui/chakra';
import Card = Horizon.Card;
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
