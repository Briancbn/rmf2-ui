'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { Horizon } from '@rmf2-ui/chakra';
import { ColorModeProvider, type ColorModeProviderProps } from './color-mode';

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={Horizon.system}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  );
}
