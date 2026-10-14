import type { ReactNode } from 'react';
import { PlanPanel } from '../plan-panel';
import { useSceneViewer2DPlanScrubber } from './use-scene-viewer-2d';

export interface SceneViewer2DPlanPanelProps {
  children?: ReactNode;
}

export function SceneViewer2DPlanPanel({
  children,
}: SceneViewer2DPlanPanelProps) {
  const {
    planClient,
    robotClient,
    robots,
    plansByRobotRef,
    planStep,
    setPlanStep,
    bumpPlanRevision,
    planModeActive,
    setPlanModeActive,
    goalInfo,
    setGoalInfo,
    clearPlanMode,
  } = useSceneViewer2DPlanScrubber();
  return (
    <PlanPanel.Root
      planClient={planClient}
      robotClient={robotClient}
      robots={robots}
      plansByRobotRef={plansByRobotRef}
      planStep={planStep}
      onStepChange={setPlanStep}
      onPlanDataChange={bumpPlanRevision}
      planModeActive={planModeActive}
      onPlanModeChange={setPlanModeActive}
      goalInfo={goalInfo}
      onGoalInfoChange={setGoalInfo}
      onClearPlanMode={clearPlanMode}
    >
      {children}
    </PlanPanel.Root>
  );
}
