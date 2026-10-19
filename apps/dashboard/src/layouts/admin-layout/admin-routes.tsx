import { Icon } from '@chakra-ui/react';
import {
  MdDashboard,
  MdEventNote,
  MdHome,
  MdMap,
  MdDevices,
  MdAccountTree,
} from 'react-icons/md';
import { FaNetworkWired } from 'react-icons/fa';
import { GrSchedules } from 'react-icons/gr';

import type { RoutesType } from '@rmf2-ui/chakra';

/** Dashboard sidebar/home metadata beyond shared {@link RoutesType}. */
export type DashboardRoute = RoutesType & {
  description?: string;
  children?: DashboardRoute[];
};

export const routes: DashboardRoute[] = [
  {
    name: 'Home',
    path: '/home',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'System',
    icon: <Icon as={MdDashboard} width="20px" height="20px" color="inherit" />,
    children: [
      {
        name: 'Network',
        path: '/system/network',
        description:
          'Monitor RMF2 services: scheduler, planner, VDA5050 master, and message brokers.',
        icon: (
          <Icon
            as={FaNetworkWired}
            width="20px"
            height="30px"
            color="inherit"
          />
        ),
      },
      {
        name: 'Device',
        path: '/operation/device',
        icon: (
          <Icon as={MdDevices} width="20px" height="30px" color="inherit" />
        ),
      },
    ],
  },

  {
    name: 'Operation',
    icon: <Icon as={MdEventNote} width="20px" height="20px" color="inherit" />,
    children: [
      {
        name: 'Schedule',
        path: '/operation/schedule',
        description:
          'Plan and review operation schedules with Gantt-style timelines.',
        icon: (
          <Icon as={GrSchedules} width="20px" height="30px" color="inherit" />
        ),
      },
      {
        name: 'Scene',
        path: '/operation/scene-viewer-2d',
        icon: <Icon as={MdMap} width="20px" height="30px" color="inherit" />,
      },
      {
        name: 'Workflow',
        path: '/operation/workflow',
        description: 'Design and execute Crossflow workflow diagrams.',
        icon: (
          <Icon as={MdAccountTree} width="20px" height="30px" color="inherit" />
        ),
      },
    ],
  },
];

export default routes;
