import type { HTMLChakraProps } from '@chakra-ui/react';
import { chakra, useRecipe } from '@chakra-ui/react';

export interface CardProps extends HTMLChakraProps<'div'> {}

export function Card(props: CardProps) {
  const recipe = useRecipe({ key: 'card' });
  const styles = recipe();
  return <chakra.div css={styles} {...props} />;
}

Card.displayName = 'Horizon.Card';
