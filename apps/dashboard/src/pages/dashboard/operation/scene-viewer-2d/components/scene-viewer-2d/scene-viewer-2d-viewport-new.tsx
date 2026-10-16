import { useCallback, useEffect, useRef, useState } from 'react'
import { MapViewer2D } from '../../classes/map-viewer-2d'
import type { MapViewer2DOptions, Node } from '../../classes/map-viewer-2d'
import { LifData } from '../../types';
import { useSceneViewer2DViewport } from './use-scene-viewer-2d';
import { Box, chakra } from '@chakra-ui/react';
import { DataSet } from 'vis-data';

export interface SceneViewer2DViewportProps extends MapViewer2DOptions {
}

interface MapViewer2DContext {
  nodes: DataSet<Node>;
  mapViewer2D: MapViewer2D;
}
export function SceneViewer2DViewport(props: SceneViewer2DViewportProps) {
  const {
    mapClient,
    setLoadStatus,
    setLoadMessage
  } = useSceneViewer2DViewport();
  const lifDataRef = useRef<LifData>(null);
  const mapViewer2DContextRef = useRef<MapViewer2DContext>(null);
  const [currentLayoutId, setCurrentLayoutId] = useState<string | null>(null);

  const containerRef = useCallback((element: HTMLDivElement) => {
    if (mapViewer2DContextRef.current !== null) {
      return;
    }

    if (element !== null) {
      // GENERATE NEW MapViewer
      element.innerHTML = '';
      const nodes: DataSet<Node> = new DataSet();
      mapViewer2DContextRef.current = {
        nodes,
        mapViewer2D: new MapViewer2D(nodes, {}, element)
      }
    }
  }, []);

  useEffect(() => {
    if (!mapViewer2DContextRef.current) {
      return;
    }

    setLoadStatus('loading');
    let cancelled = false;

    async function load() {
      try {
        const data = await mapClient.getMapData();
        if (cancelled) return;

        if (data.layouts.length === 0) {
          setLoadStatus('error');
          setLoadMessage({
            title: 'No layouts',
            description: 'The map contains no layouts.',
          });
          return;
        }

        lifDataRef.current = data;

        // TODO(anyone): allow controls of multiple layouts
        const ids = data.layouts.map((l) => l.layoutId);
        const initial =
          data.layouts[0]?.layoutId ?? ids[0] ?? null;

        setCurrentLayoutId(initial);
    if (!mapViewer2DContextRef.current) {
      return;
    }
        const newNodes: Node[] = data.layouts[0].nodes.reduce<Node[]>((acc, curr) => {
              acc.push({id: curr.nodeId, ...curr} as Node 
              )
              return acc
            }, [])
        mapViewer2DContextRef.current.nodes.update(newNodes)
        setLoadStatus('success');
      } catch (err) {
        if (cancelled) return;
        setLoadStatus('error');
        setLoadMessage({
          title: 'Failed to load map',
          description: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mapClient,
    setLoadStatus,
    setLoadMessage,
  ]);

  return (
    <Box
      position="relative"
      w="100%"
      h="100%"
      overflow="hidden"
      borderWidth="1px"
      borderRadius="lg"
    >
      <chakra.div
        ref={containerRef}
        width="100%"
        height="100%"
      />
    </Box>
  );
}

