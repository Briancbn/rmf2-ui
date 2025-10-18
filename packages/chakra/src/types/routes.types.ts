import type { JSX } from 'react';

export interface RoutesType {
  name: string;
  icon?: JSX.Element;
  path: string;
  children?: RoutesType[];
}
