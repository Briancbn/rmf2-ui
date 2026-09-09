import type { ReactNode } from 'react';

import { VdaVisualiserContext, useVdaVisualiser } from './use-vda-visualiser';

interface Props {
  children: ReactNode;
}

export function VdaVisualiserRoot({ children }: Props) {
  const ctx = useVdaVisualiser();
  return (
    <VdaVisualiserContext.Provider value={ctx}>
      {children}
    </VdaVisualiserContext.Provider>
  );
}
