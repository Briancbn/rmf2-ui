import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { IPlanClient } from '../../classes/plan-client-base';
import type { IRobotClient, RobotState } from '../../classes/robot-client-base';
import type {
  GoalInfo,
  PlanData,
} from '../scene-viewer-2d/use-scene-viewer-2d';
import { FallbackPlanClient } from '../../classes/fallback-plan-client';
import { FallbackRobotClient } from '../../classes/fallback-robot-client';

export interface UsePlanPanelProps {
  planClient?: IPlanClient;
  robotClient?: IRobotClient;
  robots?: RobotState[];
  plansByRobotRef?: React.MutableRefObject<PlanData>;
  planStep?: number;
  onStepChange?: (step: number) => void;
  onPlanDataChange?: () => void;
  planModeActive?: boolean;
  onPlanModeChange?: (active: boolean) => void;
  goalInfo?: GoalInfo;
  onGoalInfoChange?: (info: GoalInfo) => void;
  onClearPlanMode?: () => void;
}

const DEFAULT_ROBOT_CLIENT: IRobotClient = new FallbackRobotClient();
const EMPTY_PLAN_DATA: PlanData = { byRobot: {}, maxSteps: 0 };
const EMPTY_GOAL_INFO: GoalInfo = { armedRobotId: null, goals: {} };

const DEFAULT_PLAN_CLIENT: IPlanClient = new FallbackPlanClient();

export function usePlanPanel(props: UsePlanPanelProps = {}) {
  const planClient = props.planClient ?? DEFAULT_PLAN_CLIENT;
  const robotClient = props.robotClient ?? DEFAULT_ROBOT_CLIENT;
  const robots = props.robots ?? [];
  const _defaultRef = useRef<PlanData>(EMPTY_PLAN_DATA);
  const plansByRobotRef = props.plansByRobotRef ?? _defaultRef;
  const onPlanDataChange = props.onPlanDataChange;
  const [planData, setPlanData] = useState<PlanData>(EMPTY_PLAN_DATA);
  plansByRobotRef.current = planData;

  // Notify after commit: ref is already written, so the viewport renders correct data.
  useEffect(() => {
    onPlanDataChange?.();
  }, [planData, onPlanDataChange]);

  useEffect(() => {
    let cancelled = false;
    const fetchCache = () => {
      planClient.getPlanCache().then((byRobot) => {
        if (cancelled) return;
        const maxSteps = Math.max(
          0,
          ...Object.values(byRobot).map((w) => w.length),
        );
        setPlanData({ byRobot, maxSteps });
      });
    };
    fetchCache();
    const id = setInterval(fetchCache, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [planClient]);

  const [_internalStep, setInternalStep] = useState(0);
  const planStep = props.planStep ?? _internalStep;
  const setPlanStep = props.onStepChange ?? setInternalStep;

  const [_internalPlanModeActive, _setInternalPlanModeActive] = useState(false);
  const planModeActive = props.planModeActive ?? _internalPlanModeActive;
  const setPlanModeActive =
    props.onPlanModeChange ?? _setInternalPlanModeActive;

  const [_internalGoalInfo, _setInternalGoalInfo] =
    useState<GoalInfo>(EMPTY_GOAL_INFO);
  const goalInfo = props.goalInfo ?? _internalGoalInfo;
  const setGoalInfo = props.onGoalInfoChange ?? _setInternalGoalInfo;

  const clearPlanMode =
    props.onClearPlanMode ??
    (() => {
      setPlanModeActive(false);
      setGoalInfo(EMPTY_GOAL_INFO);
    });

  return {
    planClient,
    robotClient,
    robots,
    plansByRobotRef,
    planData,
    setPlanData,
    planStep,
    setPlanStep,
    planModeActive,
    setPlanModeActive,
    goalInfo,
    setGoalInfo,
    clearPlanMode,
  };
}

export type UsePlanPanelReturn = ReturnType<typeof usePlanPanel>;

export const PlanPanelContext = createContext<UsePlanPanelReturn | undefined>(
  undefined,
);

export function usePlanPanelContext() {
  const ctx = useContext(PlanPanelContext);
  if (!ctx)
    throw new Error(
      'usePlanPanelContext must be inside PlanPanelContext.Provider',
    );
  return ctx;
}
