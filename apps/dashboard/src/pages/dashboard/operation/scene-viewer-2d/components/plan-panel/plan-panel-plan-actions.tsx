import { useState } from 'react';
import {
  Badge,
  Box,
  HStack,
  IconButton,
  Input,
  NativeSelect,
  Stack,
  Text,
} from '@chakra-ui/react';
import { LuCrosshair, LuEye, LuPlus, LuSend, LuX } from 'react-icons/lu';
import { usePlanPanelContext } from './use-plan-panel';
import { RobotPanelDebugConfirmButton } from '../robot-panel/robot-panel-debug-confirm-button';

interface GoalRow {
  robotId: string;
  goal: string;
}

export function PlanPanelPlanActions() {
  const {
    planClient,
    robotClient,
    robots,
    planModeActive,
    setPlanModeActive,
    goalInfo,
    setGoalInfo,
    clearPlanMode,
    setPlanData,
  } = usePlanPanelContext();

  const [rows, setRows] = useState<GoalRow[]>([
    { robotId: robots[0]?.robotId ?? '', goal: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [result, setResult] = useState<{
    decision: string;
    errors: string[];
  } | null>(null);

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { robotId: robots[0]?.robotId ?? '', goal: '' },
    ]);

  const removeRow = (i: number) => {
    const robotId = rows[i]?.robotId;
    setRows((prev) => prev.filter((_, idx) => idx !== i));
    if (robotId) {
      setGoalInfo((prev) => ({
        armedRobotId: prev.armedRobotId === robotId ? null : prev.armedRobotId,
        goals: Object.fromEntries(
          Object.entries(prev.goals).filter(([k]) => k !== robotId),
        ),
      }));
    }
  };

  const setField = (i: number, field: keyof GoalRow, val: string) => {
    if (field === 'robotId') {
      const oldRobotId = rows[i]?.robotId;
      setRows((prev) =>
        prev.map((row, idx) =>
          idx === i ? { ...row, robotId: val, goal: '' } : row,
        ),
      );
      // Move goal from old robot to new robot in context
      setGoalInfo((prev) => {
        const oldGoal = oldRobotId ? prev.goals[oldRobotId] : undefined;
        const next = { ...prev.goals };
        if (oldRobotId) delete next[oldRobotId];
        if (oldGoal) next[val] = oldGoal;
        return {
          armedRobotId:
            prev.armedRobotId === oldRobotId ? val : prev.armedRobotId,
          goals: next,
        };
      });
    } else {
      setRows((prev) =>
        prev.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)),
      );
    }
  };

  // Sync armed robot and goals from rows into context (for map node picking)
  const armRow = (i: number) => {
    const row = rows[i];
    if (!row) return;
    setGoalInfo((prev) => ({
      armedRobotId: prev.armedRobotId === row.robotId ? null : row.robotId,
      goals: prev.goals,
    }));
    setPlanModeActive(true);
  };

  // When context goal changes (node clicked on map), sync back to rows
  const syncedRows = rows.map((row) => ({
    ...row,
    goal: goalInfo.goals[row.robotId] ?? row.goal,
  }));

  const handleGoalInput = (i: number, val: string) => {
    setField(i, 'goal', val);
    // Keep context in sync
    const robotId = rows[i]?.robotId;
    if (robotId) {
      setGoalInfo((prev) => ({
        ...prev,
        goals: val
          ? { ...prev.goals, [robotId]: val }
          : Object.fromEntries(
              Object.entries(prev.goals).filter(([k]) => k !== robotId),
            ),
      }));
    }
  };

  const hasPending = syncedRows.some((r) => r.robotId && r.goal);

  const handleClear = () => {
    clearPlanMode();
    setRows([{ robotId: robots[0]?.robotId ?? '', goal: '' }]);
  };

  const buildPlanDataFromResponse = (
    tasks: { robotId: string; goal: string }[],
    res: Awaited<ReturnType<typeof planClient.submitTasks>>,
  ) => {
    const byRobot: Record<
      string,
      import('../../classes/plan-client-base').PlanWaypoint[]
    > = {};
    res.plans.forEach((plan, i) => {
      const robotId = plan.robotId ?? tasks[i]?.robotId;
      if (robotId && plan.waypoints.length > 0)
        byRobot[robotId] = plan.waypoints;
    });
    const maxSteps = Math.max(
      0,
      ...Object.values(byRobot).map((w) => w.length),
    );
    return { byRobot, maxSteps };
  };

  const doPreview = async () => {
    const tasks = syncedRows
      .filter((r) => r.robotId && r.goal)
      .map((r) => ({ robotId: r.robotId, goal: r.goal }));
    if (tasks.length === 0) return;
    setPreviewing(true);
    setResult(null);
    try {
      const res = await planClient.submitTasks(tasks, { mode: 'plan' });
      const data = buildPlanDataFromResponse(tasks, res);
      if (data.maxSteps > 0) setPlanData(data);
      setResult({ decision: res.decision, errors: res.errors });
    } catch (err) {
      setResult({ decision: 'ERROR', errors: [String(err)] });
    } finally {
      setPreviewing(false);
    }
  };

  const doSubmit = async () => {
    const tasks = syncedRows
      .filter((r) => r.robotId && r.goal)
      .map((r) => ({ robotId: r.robotId, goal: r.goal }));
    if (tasks.length === 0) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await planClient.submitTasks(tasks, { mode: 'submit' });
      const byRobot = await planClient.getPlanCache();
      const maxSteps = Math.max(
        0,
        ...Object.values(byRobot).map((w) => w.length),
      );
      setPlanData({ byRobot, maxSteps });
      handleClear();
      setResult({ decision: res.decision, errors: res.errors });
    } catch (err) {
      setResult({ decision: 'ERROR', errors: [String(err)] });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack gap={3}>
      {/* Goals */}
      <Stack gap={1}>
        <HStack>
          <Text fontSize="xs" textTransform="uppercase" flex="1">
            Goals
          </Text>
          <IconButton
            aria-label="Add goal"
            size="2xs"
            variant="ghost"
            onClick={addRow}
          >
            <LuPlus />
          </IconButton>
        </HStack>

        {syncedRows.map((row, i) => {
          const isArmed =
            planModeActive && goalInfo.armedRobotId === row.robotId;
          const robotIdx = robots.findIndex((r) => r.robotId === row.robotId);
          const color = row.robotId
            ? robotClient.getRobotColor(
                row.robotId,
                robotIdx >= 0 ? robotIdx : i,
              )
            : null;

          return (
            <HStack key={i} gap={1} align="center">
              {/* Robot selector */}
              <NativeSelect.Root size="xs" flex="1">
                <NativeSelect.Field
                  value={row.robotId}
                  onChange={(e) => setField(i, 'robotId', e.target.value)}
                >
                  {robots.map((r) => (
                    <option key={r.robotId} value={r.robotId}>
                      {r.robotId}
                    </option>
                  ))}
                  {robots.length === 0 && <option value="">No robots</option>}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>

              {/* Goal input */}
              <Input
                size="xs"
                fontFamily="mono"
                placeholder="goal node"
                flex="1"
                value={row.goal}
                onChange={(e) => handleGoalInput(i, e.target.value)}
              />

              {/* Arm for map picking */}
              <IconButton
                aria-label={isArmed ? 'Disarm' : 'Pick on map'}
                size="2xs"
                variant={isArmed ? 'solid' : 'ghost'}
                colorPalette={isArmed ? 'orange' : undefined}
                onClick={() => armRow(i)}
                title="Click to arm, then click a node on the map"
              >
                {color && !isArmed ? (
                  <Box w="8px" h="8px" borderRadius="full" bg={color} />
                ) : (
                  <LuCrosshair />
                )}
              </IconButton>

              <IconButton
                aria-label="Remove"
                size="2xs"
                variant="ghost"
                colorPalette="red"
                onClick={() => removeRow(i)}
              >
                <LuX />
              </IconButton>
            </HStack>
          );
        })}
      </Stack>

      {/* Actions */}
      <HStack gap={2}>
        <RobotPanelDebugConfirmButton
          title="Preview plan?"
          description="Run a dry-run (or plan-only) to preview waypoints without dispatching to the robot."
          onConfirm={() => void doPreview()}
          size="xs"
          variant="outline"
          colorPalette="blue"
          loading={previewing}
          disabled={!hasPending}
          flex="1"
        >
          <LuEye />
          Preview
        </RobotPanelDebugConfirmButton>

        <RobotPanelDebugConfirmButton
          title="Submit plan task?"
          description={
            <>
              This will dispatch{' '}
              <Text as="span" fontFamily="mono" fontWeight="bold">
                {syncedRows.filter((r) => r.robotId && r.goal).length} goal
                {syncedRows.filter((r) => r.robotId && r.goal).length !== 1
                  ? 's'
                  : ''}
              </Text>{' '}
              to the plan server.
            </>
          }
          onConfirm={() => void doSubmit()}
          size="xs"
          variant="outline"
          colorPalette="green"
          loading={submitting}
          disabled={!hasPending}
          flex="1"
        >
          <LuSend />
          Submit
        </RobotPanelDebugConfirmButton>
      </HStack>

      {result && (
        <Stack gap={1}>
          <HStack gap={2}>
            <Badge
              size="sm"
              colorPalette={
                result.decision === 'ACCEPTED' || result.decision === 'DRY_RUN'
                  ? 'green'
                  : 'red'
              }
            >
              {result.decision}
            </Badge>
          </HStack>
          {result.errors.map((e, i) => (
            <Text key={i} fontSize="xs" color="red.500">
              {e}
            </Text>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
