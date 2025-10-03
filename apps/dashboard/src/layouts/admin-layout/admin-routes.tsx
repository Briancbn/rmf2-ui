import { Icon } from '@chakra-ui/react';
import { MdOutlineTask, MdHome } from 'react-icons/md';
import { FaNetworkWired } from 'react-icons/fa';
import { SiUnrealengine } from 'react-icons/si';
import { GrSchedules } from 'react-icons/gr';

export const routes: RoutesType[] = [
  {
    name: 'Home',
    path: '/home',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
  },
  {
    name: 'Network',
    path: '/network',
    icon: (
      <Icon as={FaNetworkWired} width="20px" height="30px" color="inherit" />
    ),
  },
  {
    name: 'Simulation',
    icon: (
      <Icon as={SiUnrealengine} width="20px" height="30px" color="inherit" />
    ),
    path: '/simulation',
  },
  {
    name: 'Operations',
    path: '/operation',
    icon: (
      <Icon as={MdOutlineTask} width="20px" height="30px" color="inherit" />
    ),
    children: [
      {
        name: 'Schedule',
        path: '/operation/schedule',
        icon: (
          <Icon as={GrSchedules} width="20px" height="30px" color="inherit" />
        ),
      },
    ],
  },
];

export default routes;
