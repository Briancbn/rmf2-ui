import type { BoxProps, ComboboxRootProps } from '@chakra-ui/react';
import {
  Box,
  Combobox,
  Field,
  Flex,
  Portal,
  useFilter,
  useListCollection,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useProcessViewerControlPanel } from './use-process-viewer';

export interface ProcessViewerProcessSelectorProps
  extends Omit<
    ComboboxRootProps<string>,
    | 'collection'
    | 'value'
    | 'inputValue'
    | 'onInputValueChange'
    | 'onValueChange'
    | 'children'
  > {}

export function ProcessViewerProcessSelector(
  props: ProcessViewerProcessSelectorProps,
) {
  const { ...rest } = props;
  const { processes, selectedProcessId, setSelectedProcessId } =
    useProcessViewerControlPanel();
  const { contains } = useFilter({ sensitivity: 'base' });
  const {
    collection,
    filter,
    set: setCollection,
  } = useListCollection<string>({
    initialItems: processes.map((p) => p.id),
    filter: contains,
  });

  const [inputValue, setInputValue] = useState(selectedProcessId ?? '');

  useEffect(() => {
    setCollection(processes.map((p) => p.id));
  }, [processes, setCollection]);

  useEffect(() => {
    filter('');
    setInputValue(selectedProcessId ?? '');
  }, [selectedProcessId]);

  return (
    <Combobox.Root
      collection={collection}
      value={selectedProcessId ? [selectedProcessId] : []}
      inputValue={inputValue}
      onInputValueChange={(e) => {
        setInputValue(e.inputValue);
        filter(e.inputValue);
      }}
      onValueChange={(e) => setSelectedProcessId(e.value[0])}
      {...rest}
    >
      <Combobox.Control>
        <Combobox.Input placeholder="Type to search" />
        <Combobox.IndicatorGroup>
          <Combobox.ClearTrigger />
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      <Portal>
        <Combobox.Positioner>
          <Combobox.Content>
            <Combobox.Empty>No items found</Combobox.Empty>
            {collection.items.map((item) => (
              <Combobox.Item item={item} key={item}>
                {item}
                <Combobox.ItemIndicator />
              </Combobox.Item>
            ))}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  );
}

export interface ProcessViewerControlPanelProps
  extends Omit<BoxProps, 'children'> {}

export function ProcessViewerControlPanel(
  props: ProcessViewerControlPanelProps,
) {
  const { ...rest } = props;
  return (
    <Box {...rest}>
      <Field.Root>
        <Field.Label>Process ID</Field.Label>
        <Flex alignItems="center" gap="10px">
          <ProcessViewerProcessSelector w="350px" />
        </Flex>
      </Field.Root>
    </Box>
  );
}
