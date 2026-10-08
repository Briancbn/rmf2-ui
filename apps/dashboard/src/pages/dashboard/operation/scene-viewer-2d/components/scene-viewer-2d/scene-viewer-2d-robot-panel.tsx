import type { ReactNode } from 'react';
import { RobotPanel } from '../robot-panel';
import { useSceneViewer2DRobots } from './use-scene-viewer-2d';

export interface SceneViewer2DRobotPanelProps {
  children?: ReactNode;
}

export function SceneViewer2DRobotPanel({
  children,
}: SceneViewer2DRobotPanelProps) {
  const { selectedRobotId, setSelectedRobotId, robotClient } =
    useSceneViewer2DRobots();
  return (
    <RobotPanel.Root
      robotClient={robotClient}
      selected={selectedRobotId}
      onSelect={setSelectedRobotId}
    >
      {children}
    </RobotPanel.Root>
  );
}
