import { useEffect, useState } from 'react';
import { Flex, Button, IconButton, Menu, Portal, Text } from '@chakra-ui/react';
import { Tooltip } from '@/components/ui/tooltip';
import { LuPlus, LuMinus, LuChevronUp } from 'react-icons/lu';
import { SceneViewer2DPanel } from './scene-viewer-2d-panel';
import type { SceneViewer2DPanelProps } from './scene-viewer-2d-panel';
import { useSceneViewer2DControls } from './use-scene-viewer-2d';

const iconButtonProps = {
  size: 'sm',
  variant: 'surface',
  pointerEvents: 'auto',
  borderRadius: '2xl',
  css: { _icon: { width: '18px', height: '18px' } },
} as const;

// ─── Zoom ────────────────────────────────────────────────────────────────────

interface SceneViewer2DZoomControlsProps {
  zoomStep?: number;
  zoomPresets?: number[];
}

export function SceneViewer2DZoomControls({
  zoomStep = 1.25,
  zoomPresets = [25, 50, 100, 150, 200],
}: SceneViewer2DZoomControlsProps) {
  const { registerZoomListener, setTargetZoom } = useSceneViewer2DControls();
  const [zoomDisplay, setZoomDisplay] = useState(100);

  useEffect(
    () => registerZoomListener((z) => setZoomDisplay(Math.round(z))),
    [registerZoomListener],
  );

  return (
    <Flex gap="10px" align="center">
      <Tooltip content="Zoom out">
        <IconButton
          aria-label="Zoom out"
          onClick={() => setTargetZoom(zoomDisplay / zoomStep)}
          {...iconButtonProps}
        >
          <LuMinus />
        </IconButton>
      </Tooltip>

      <Menu.Root>
        <Menu.Trigger asChild>
          <Button
            size="xs"
            variant="ghost"
            minW="3.5em"
            px={2}
            fontWeight={600}
          >
            <Text fontSize="xs">{zoomDisplay}%</Text>
          </Button>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              {zoomPresets.map((preset) => (
                <Menu.Item
                  key={preset}
                  value={String(preset)}
                  fontWeight={zoomDisplay === preset ? 'semibold' : 'normal'}
                  onClick={() => setTargetZoom(preset)}
                >
                  {preset}%
                </Menu.Item>
              ))}
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>

      <Tooltip content="Zoom in">
        <IconButton
          aria-label="Zoom in"
          onClick={() => setTargetZoom(zoomDisplay * zoomStep)}
          {...iconButtonProps}
        >
          <LuPlus />
        </IconButton>
      </Tooltip>
    </Flex>
  );
}

// ─── Fit mode ────────────────────────────────────────────────────────────────

type FitMode = 'map' | 'robots' | 'all';

const DEFAULT_FIT_MODES: { value: FitMode; label: string }[] = [
  { value: 'map', label: 'Map' },
  { value: 'robots', label: 'Robots' },
  { value: 'all', label: 'All' },
];

interface SceneViewer2DFitModeControlsProps {
  fitModes?: { value: FitMode; label: string }[];
}

export function SceneViewer2DFitModeControls({
  fitModes = DEFAULT_FIT_MODES,
}: SceneViewer2DFitModeControlsProps) {
  const { fitMode, setFitMode, triggerFit } = useSceneViewer2DControls();
  const current = fitModes.find((m) => m.value === fitMode)?.label ?? 'Fit';

  return (
    <Flex align="center">
      <Button
        size="xs"
        variant="outline"
        _hover={{ bg: 'gray.200' }}
        borderLeftRadius="lg"
        borderRightRadius="0px"
        flexShrink={0}
        onClick={triggerFit}
      >
        Fit {current}
      </Button>

      <Menu.Root>
        <Menu.Trigger asChild>
          <Button
            size="xs"
            variant="outline"
            _hover={{ bg: 'gray.200' }}
            borderLeftRadius={0}
            borderRightRadius="lg"
            borderLeft="1px solid"
            borderLeftColor="whiteAlpha.300"
            px={1.5}
            minW={0}
          >
            <LuChevronUp />
          </Button>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              {fitModes.map(({ value, label }) => (
                <Menu.Item
                  key={value}
                  value={value}
                  fontWeight={fitMode === value ? 'semibold' : 'normal'}
                  onClick={() => setFitMode(value)}
                >
                  {label}
                </Menu.Item>
              ))}
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </Flex>
  );
}

// ─── Combined ────────────────────────────────────────────────────────────────

export function SceneViewer2DControls(props: SceneViewer2DPanelProps) {
  return (
    <SceneViewer2DPanel
      variant="bottom-left"
      borderWidth="0px"
      pointerEvents="auto"
      gap="10px"
      {...props}
    >
      <SceneViewer2DZoomControls />
      <SceneViewer2DFitModeControls />
    </SceneViewer2DPanel>
  );
}
