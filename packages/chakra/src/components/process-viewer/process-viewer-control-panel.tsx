import type { ComboboxRootProps, FlexProps } from '@chakra-ui/react';
import {
  Combobox,
  Field,
  Flex,
  Portal,
  useFilter,
  useListCollection,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useProcessViewerControlPanel } from './use-process-viewer';

export interface ProcessViewerControlPanelProps extends FlexProps {}

export function ProcessViewerControlPanel(
  props: ProcessViewerControlPanelProps,
) {
  const { children, ...rest } = props;
  return (
    <Flex
      justify="end"
      direction={{ base: 'column', sm: 'row' }}
      gap="5px"
      mb="10px"
      {...rest}
    >
      {children}
    </Flex>
  );
}

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

  // Hook for changes in `processes` data
  useEffect(() => {
    setCollection(processes.map((p) => p.id));
  }, [processes, setCollection]);

  // Hook when a process id is selected
  useEffect(() => {
    // Clear the filter
    filter('');
    // display the processId as input
    setInputValue(selectedProcessId ?? '');
  }, [selectedProcessId, filter]);

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

export interface ProcessViewerDefaultControlsProps extends FlexProps {}

export function ProcessViewerDefaultControls(
  props: ProcessViewerDefaultControlsProps,
) {
  return (
    <ProcessViewerControlPanel {...props}>
      <Field.Root>
        <Field.Label>Process ID</Field.Label>
        <ProcessViewerProcessSelector w="350px" />
      </Field.Root>
    </ProcessViewerControlPanel>
  );
}
