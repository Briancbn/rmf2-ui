import { Provider } from '@/components/ui/provider';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from '@/components/ui/toaster';
import { Cypress, Horizon } from '@rmf2-ui/chakra';
import App from './App.tsx';

// Import fonts
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/500.css';
import '@fontsource/open-sans/700.css';

const _THEMES = {
  horizon: Horizon.system,
  cypress: Cypress.system,
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider themes={_THEMES} defaultTheme="horizon">
      <App />
      <Toaster />
    </Provider>
  </StrictMode>,
);
