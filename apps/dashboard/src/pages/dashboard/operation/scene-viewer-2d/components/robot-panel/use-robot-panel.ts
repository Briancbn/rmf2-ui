import { createContext, useContext, useEffect, useState } from 'react';
import type { IRobotClient, RobotState } from '../../classes/robot-client-base';
import { FallbackRobotClient } from '../../classes/fallback-robot-client';

export interface UseRobotPanelProps {
  robotClient?: IRobotClient;
  selected?: string | null;
  onSelect?: (id: string | null) => void;
}

const DEFAULT_ROBOT_CLIENT: IRobotClient = new FallbackRobotClient();

export function useRobotPanel(props: UseRobotPanelProps = {}) {
  const robotClient = props.robotClient ?? DEFAULT_ROBOT_CLIENT;
  const [robots, setRobots] = useState<RobotState[]>([]);
  const [robotIndexMap, setRobotIndexMap] = useState<Map<string, number>>(
    new Map(),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const selectedExternal = props.selected;

  useEffect(
    () =>
      robotClient.subscribeRobotStates((incoming) => {
        setRobots(incoming);
        setRobotIndexMap(new Map(incoming.map((r, i) => [r.robotId, i])));
      }),
    [robotClient],
  );

  const selectedId =
    selectedExternal !== undefined ? selectedExternal : selected;
  const setSelectedId = props.onSelect ?? setSelected;

  return { robotClient, robots, robotIndexMap, selectedId, setSelectedId };
}

export type UseRobotPanelReturn = ReturnType<typeof useRobotPanel>;

export const RobotPanelContext = createContext<UseRobotPanelReturn | undefined>(
  undefined,
);

export function useRobotPanelContext() {
  const ctx = useContext(RobotPanelContext);
  if (!ctx)
    throw new Error(
      'useRobotPanelContext must be inside RobotPanelContext.Provider',
    );
  return ctx;
}
