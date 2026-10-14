import { Box, Card, HStack, Table, Text } from '@chakra-ui/react';
import type { PlanWaypoint } from '../../classes/plan-client-base';

export interface PlanPanelPlanCardProps {
  robotId: string;
  waypoints: PlanWaypoint[];
  currentStep: number;
  onStepChange?: (step: number) => void;
}

export function PlanPanelPlanCard({
  robotId,
  waypoints,
  currentStep,
  onStepChange,
}: PlanPanelPlanCardProps) {
  const clampedStep = Math.min(currentStep, waypoints.length - 1);

  return (
    <Card.Root size="sm" variant="outline">
      <Card.Body gap="8px" overflowY="auto">
        <Text fontWeight={700} truncate>
          {robotId}
        </Text>

        <Table.Root size="sm" variant="outline">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>#</Table.ColumnHeader>
              <Table.ColumnHeader>Name</Table.ColumnHeader>
              <Table.ColumnHeader>Position</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {waypoints.map((wp, wi) => {
              const isCurrent = wi === clampedStep;
              const isPast = wi < clampedStep;
              return (
                <Table.Row
                  key={wi}
                  bg={isCurrent ? 'blue.subtle' : undefined}
                  opacity={isPast ? 0.45 : 1}
                  cursor={onStepChange ? 'pointer' : undefined}
                  _hover={onStepChange ? { bg: 'bg.subtle' } : undefined}
                  onClick={onStepChange ? () => onStepChange(wi) : undefined}
                >
                  <Table.Cell>
                    <HStack gap={1}>
                      {isCurrent && (
                        <Box
                          w="6px"
                          h="6px"
                          borderRadius="full"
                          bg="blue.500"
                          flexShrink={0}
                        />
                      )}
                      <Text
                        fontSize="xs"
                        color={isCurrent ? 'blue.fg' : 'fg.muted'}
                      >
                        {wi + 1}
                      </Text>
                    </HStack>
                  </Table.Cell>
                  <Table.Cell fontFamily="mono" fontSize="xs">
                    {wp.name}
                  </Table.Cell>
                  <Table.Cell fontSize="xs" color="fg.muted">
                    ({wp.position[0].toFixed(1)}, {wp.position[1].toFixed(1)})
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table.Root>
      </Card.Body>
    </Card.Root>
  );
}
