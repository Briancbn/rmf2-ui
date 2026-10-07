import { useRobotPanelContext } from './use-robot-panel';
import { RobotPanelCard } from './robot-panel-card';

export function RobotPanelSelectedCard() {
  const { robots, selectedId } = useRobotPanelContext();
  const robot = robots.find((r) => r.robotId === selectedId) ?? null;
  if (!robot) return null;
  return <RobotPanelCard robot={robot} />;
}
