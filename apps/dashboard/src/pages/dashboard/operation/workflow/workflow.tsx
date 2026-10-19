import { Box, Flex, Text } from '@chakra-ui/react';
import { Horizon } from '@rmf2-ui/chakra';
import { DiagramEditorWidget } from '@rmf2-ui/diagram-editor';
import Card = Horizon.Card;
import { RTOConfig } from '@/clients';

const baseUrl = (RTOConfig.BASE ?? 'http://localhost:2727').replace(/\/$/, '');

// Admin layout top padding (120px md) + bottom padding (30px) + card padding (50px) + title row (44px) + gap (12px)
const EDITOR_HEIGHT = 'calc(100vh - 280px)';

export function WorkflowPage() {
  return (
    <Box>
      <Card flexDirection="column" gap="12px" p="25px">
        <Flex justifyContent="space-between" align="center">
          <Text fontSize="22px" fontWeight="700" lineHeight="100%">
            Workflow Editor
          </Text>
        </Flex>
        <Box
          h={EDITOR_HEIGHT}
          minH="400px"
          borderRadius="md"
          overflow="hidden"
          position="relative"
        >
          <DiagramEditorWidget baseUrl={baseUrl} />
        </Box>
      </Card>
    </Box>
  );
}
