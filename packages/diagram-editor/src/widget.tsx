import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@material-symbols/font-400';
import '@xyflow/react/dist/style.css';
import './crossflow-app.css';
import { ScopedCssBaseline, ThemeProvider } from '@mui/material';
import {
  ApiClientProvider,
  DiagramEditor,
  DiagramPropertiesProvider,
  DiagramSidePanelProvider,
  RegistryProvider,
  TemplatesProvider,
  TransientEditorDraftProvider,
} from 'crossflow-diagram-editor/lib';
import { useMemo } from 'react';
import { useTheme } from 'next-themes';
import { ConfigurableApiClient } from './configurable-api-client';
import { createHorizonTheme } from './theme';

export interface DiagramEditorWidgetProps {
  baseUrl?: string;
}

export function DiagramEditorWidget({
  baseUrl = '',
}: DiagramEditorWidgetProps) {
  const { resolvedTheme, forcedTheme } = useTheme();
  const mode = (forcedTheme ?? resolvedTheme) === 'light' ? 'light' : 'dark';
  const muiTheme = useMemo(() => createHorizonTheme(mode), [mode]);
  const apiClient = useMemo(
    () => new ConfigurableApiClient(baseUrl),
    [baseUrl],
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <ScopedCssBaseline
        enableColorScheme
        style={{ width: '100%', height: '100%' }}
      >
        <ApiClientProvider value={apiClient}>
          <RegistryProvider>
            <TransientEditorDraftProvider>
              <TemplatesProvider>
                <DiagramPropertiesProvider>
                  <DiagramSidePanelProvider>
                    <DiagramEditor />
                  </DiagramSidePanelProvider>
                </DiagramPropertiesProvider>
              </TemplatesProvider>
            </TransientEditorDraftProvider>
          </RegistryProvider>
        </ApiClientProvider>
      </ScopedCssBaseline>
    </ThemeProvider>
  );
}
