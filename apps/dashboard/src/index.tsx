import { DynamicThemeProvider } from '@/components/ui/dynamic-theme-provider';
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DynamicThemeProvider
      themes={[Horizon.themeConfig, Cypress.themeConfig]}
      defaultTheme="horizon"
    >
      <App />
      <Toaster />
    </DynamicThemeProvider>
  </StrictMode>,
);
