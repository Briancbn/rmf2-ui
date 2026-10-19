import { createTheme } from '@mui/material/styles';

export function createHorizonTheme(mode: 'light' | 'dark') {
  return createTheme({
    cssVariables: true,
    palette: {
      mode,
      ...(mode === 'light' && {
        background: {
          default: 'var(--chakra-colors-gray-200)',
          paper: 'var(--chakra-colors-gray-100)',
        },
        // MUI calls alpha() on text + divider, so CSS vars would throw —
        // use Chakra v3's gray scale hex values (Tailwind zinc-based) instead.
        text: { primary: '#27272a' }, // gray-800
      }),
      primary:
        mode === 'dark'
          ? {
              main: 'var(--chakra-colors-cyan-500)',
              light: 'var(--chakra-colors-cyan-400)',
              dark: 'var(--chakra-colors-cyan-700)',
              contrastText: '#000000',
            }
          : {
              main: 'var(--chakra-colors-cyan-700)',
              light: 'var(--chakra-colors-cyan-600)',
              dark: 'var(--chakra-colors-cyan-800)',
              contrastText: '#ffffff',
            },
    },
    components: {
      // Contain the persistent Drawer inside the widget card.
      // The ReactFlow container has position:relative + overflow:hidden;
      // making the Paper absolute keeps it within those bounds.
      MuiDrawer: {
        styleOverrides: {
          paper: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            height: '100%',
          },
        },
      },
    },
  });
}
