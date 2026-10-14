import { useState } from 'react';
import { Box, Flex, Stack, Text } from '@chakra-ui/react';
import { usePlanPanelContext } from './use-plan-panel';
import { PlanPanelPlanCard } from './plan-panel-plan-card';

export function PlanPanelPlanInfo() {
  const { planData, planStep, setPlanStep, robotClient } =
    usePlanPanelContext();
  const { byRobot, maxSteps } = planData;
  const robotIds = Object.keys(byRobot);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (maxSteps === 0 || robotIds.length === 0) {
    return (
      <Text fontSize="sm" color="fg.muted">
        No plan data.
      </Text>
    );
  }

  const selected = selectedId && byRobot[selectedId] ? selectedId : null;

  return (
    <Flex direction="column" flex="1" minH={0} gap={0}>
      {/* Robot list */}
      <Stack gap={0} flex="1" overflowY="auto">
        {robotIds.map((robotId, robotIdx) => {
          const waypoints = byRobot[robotId] ?? [];
          const isSelected = robotId === selected;
          const step = Math.min(planStep, waypoints.length - 1);
          const currentWp = waypoints[step];
          const color = robotClient.getRobotColor(robotId, robotIdx);

          return (
            <Flex
              key={robotId}
              px="8px"
              py="6px"
              gap="8px"
              alignItems="center"
              cursor="pointer"
              borderRadius="md"
              bg={isSelected ? 'bg.subtle' : 'transparent'}
              borderWidth="1px"
              borderColor={isSelected ? 'border' : 'transparent'}
              _hover={{ bg: 'bg.subtle' }}
              onClick={() => setSelectedId(isSelected ? null : robotId)}
              minH="40px"
            >
              <Box
                w="10px"
                h="10px"
                borderRadius="full"
                bg={color}
                flexShrink={0}
              />
              <Text fontSize="sm" fontWeight={600} flex="1" minW={0} truncate>
                {robotId}
              </Text>
              {currentWp && (
                <Text fontSize="xs" fontFamily="mono" color="fg.muted">
                  {currentWp.name}
                </Text>
              )}
              <Text fontSize="xs" color="fg.muted" flexShrink={0}>
                {step + 1} / {waypoints.length}
              </Text>
            </Flex>
          );
        })}
      </Stack>

      {/* Waypoint card for selected robot */}
      {selected && (
        <Box flexShrink={0} mt={2}>
          <PlanPanelPlanCard
            robotId={selected}
            waypoints={byRobot[selected] ?? []}
            currentStep={planStep}
            onStepChange={setPlanStep}
          />
        </Box>
      )}
    </Flex>
  );
}
