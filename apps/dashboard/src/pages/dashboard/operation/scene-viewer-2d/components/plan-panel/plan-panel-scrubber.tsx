import { useEffect, useRef, useState } from 'react';
import { Box, Flex, HStack, IconButton, Slider, Text } from '@chakra-ui/react';
import { LuPlay, LuPause, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { usePlanPanelContext } from './use-plan-panel';

const PLAY_MS = 600;

const iconButtonProps = {
  size: 'sm',
  variant: 'surface',
  borderRadius: '2xl',
  css: { _icon: { width: '18px', height: '18px' } },
} as const;

export function PlanPanelScrubber() {
  const { planData, planStep, setPlanStep } = usePlanPanelContext();
  const maxSteps = planData.maxSteps;

  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (maxSteps === 0) setPlaying(false);
  }, [maxSteps]);

  useEffect(() => {
    if (!playing) {
      if (intervalRef.current != null) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setPlanStep((s) => {
        if (s >= maxSteps - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, PLAY_MS);
    return () => {
      if (intervalRef.current != null) clearInterval(intervalRef.current);
    };
  }, [playing, maxSteps, setPlanStep]);

  if (maxSteps === 0) return null;

  const clampedStep = Math.min(planStep, maxSteps - 1);

  return (
    <Flex direction="column" gap={2}>
      <Text fontSize="xs" textTransform="uppercase" color="fg.muted">
        Plan Preview
      </Text>
      <HStack gap="10px" align="center" px={1}>
        <IconButton
          aria-label="Step back"
          disabled={clampedStep <= 0}
          onClick={() => setPlanStep((s) => Math.max(0, s - 1))}
          {...iconButtonProps}
        >
          <LuChevronLeft />
        </IconButton>

        <IconButton
          aria-label={playing ? 'Pause' : 'Play'}
          onClick={() => {
            if (clampedStep >= maxSteps - 1) setPlanStep(0);
            setPlaying((p) => !p);
          }}
          {...iconButtonProps}
        >
          {playing ? <LuPause /> : <LuPlay />}
        </IconButton>

        <IconButton
          aria-label="Step forward"
          disabled={clampedStep >= maxSteps - 1}
          onClick={() => setPlanStep((s) => Math.min(maxSteps - 1, s + 1))}
          {...iconButtonProps}
        >
          <LuChevronRight />
        </IconButton>

        <Box flex="1" px={1}>
          <Slider.Root
            min={0}
            max={Math.max(0, maxSteps - 1)}
            step={1}
            value={[clampedStep]}
            onValueChange={(e) => {
              setPlaying(false);
              setPlanStep(e.value[0] ?? 0);
            }}
          >
            <Slider.Control>
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              <Slider.Thumb index={0} />
            </Slider.Control>
          </Slider.Root>
        </Box>

        <Text
          fontSize="xs"
          color="fg.muted"
          whiteSpace="nowrap"
          minW="40px"
          textAlign="right"
        >
          {clampedStep + 1} / {maxSteps}
        </Text>
      </HStack>
    </Flex>
  );
}
