import { Flex } from '@chakra-ui/react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HSeparator = (props: { variant?: string; [x: string]: any }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { variant, ...rest } = props;
  return <Flex h="1px" w="100%" bg="rgba(135, 140, 189, 0.3)" {...rest} />;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const VSeparator = (props: { variant?: string; [x: string]: any }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { variant, ...rest } = props;
  return <Flex w="1px" bg="rgba(135, 140, 189, 0.3)" {...rest} />;
};

export { HSeparator, VSeparator };
