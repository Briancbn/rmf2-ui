import { Flex } from '@chakra-ui/react';

import { RMF2Logo } from '@/components/icons';
import { HSeparator } from '@/components/separator';

export function SidebarBrand() {
  const logoColor = { base: 'navy.700', _dark: 'white' };
  return (
    <Flex alignItems="center" flexDirection="column">
      <RMF2Logo h="70px" w="180px" my="10px" color={logoColor} />
      <HSeparator mb="20px" />
    </Flex>
  );
}

export default SidebarBrand;
