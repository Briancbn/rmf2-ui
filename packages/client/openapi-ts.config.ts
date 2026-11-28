import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig([
  {
    input: 'src/rts/openapi.json',
    output: {
      path: 'src/rts/generated',
    },
  },
  {
    input: 'src/map/openapi.json',
    output: {
      path: 'src/map/generated',
    },
  },
]);
