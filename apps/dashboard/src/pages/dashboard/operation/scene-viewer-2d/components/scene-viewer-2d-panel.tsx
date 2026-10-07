import { chakra, HTMLChakraProps } from '@chakra-ui/react';

export interface SceneViewer2DPanelProps extends HTMLChakraProps<'div'> {}

export const SceneViewer2DPanel = chakra('div', {
  base: {
    position: 'absolute',
    color: 'fg',
    wordWrap: 'break-word',
    borderRadius: 'l3',
    borderWidth: '1px',
    borderColor: 'border',
    bg: 'bg/80',
    backdropFilter: 'blur(4px)',
    padding: 1.5,
    display: 'flex',
  },
  variants: {
    variant: {
      'bottom-left': {
        bottom: '20px',
        left: '20px',
        flexDirection: 'row',
        gap: 1,
      },
      'bottom-right': {
        bottom: '20px',
        right: '20px',
        flexDirection: 'row',
        gap: 1,
      },
    },
  },
});

SceneViewer2DPanel.displayName = 'SceneViewer2D.Panel';
