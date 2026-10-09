import { Flex, HStack, IconButton, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { useRobotPanelContext } from './use-robot-panel';
import { RobotPanelInfo } from './robot-panel-info';

// ─── InfoList ─────────────────────────────────────────────────────────────────

export interface RobotPanelInfoListProps {
  pageSize?: number;
}

export function RobotPanelInfoList({ pageSize = 10 }: RobotPanelInfoListProps) {
  const { robots, robotIndexMap, selectedId, setSelectedId, expanded } =
    useRobotPanelContext();
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(robots.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageRobots = robots.slice(
    safePage * pageSize,
    (safePage + 1) * pageSize,
  );

  const handleSelect = (robotId: string) => {
    setSelectedId(robotId === selectedId ? null : robotId);
  };

  if (expanded) return null;

  if (robots.length === 0) {
    return (
      <Text color="fg.muted" fontSize="sm">
        No robots connected.
      </Text>
    );
  }

  return (
    <Flex direction="column" gap={0} flex="1" minH={0}>
      {totalPages > 1 && (
        <HStack
          justify="space-between"
          align="center"
          px="8px"
          py="4px"
          flexShrink={0}
        >
          <IconButton
            aria-label="Previous page"
            variant="ghost"
            size="xs"
            disabled={safePage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            <LuChevronLeft />
          </IconButton>
          <Text fontSize="xs" color="fg.muted">
            {safePage + 1} / {totalPages}
          </Text>
          <IconButton
            aria-label="Next page"
            variant="ghost"
            size="xs"
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            <LuChevronRight />
          </IconButton>
        </HStack>
      )}
      <Stack gap={0} flex="1" overflowY="auto">
        {pageRobots.map((robot) => (
          <RobotPanelInfo
            key={robot.robotId}
            robot={robot}
            index={robotIndexMap.get(robot.robotId) ?? 0}
            selected={robot.robotId === selectedId}
            onSelect={() => handleSelect(robot.robotId)}
          />
        ))}
        {safePage < totalPages - 1 && (
          <Text
            fontSize="sm"
            fontWeight={600}
            color="fg.subtle"
            textAlign="center"
            py="4px"
            flexShrink={0}
          >
            …
          </Text>
        )}
      </Stack>
    </Flex>
  );
}
