import type { UserConfig } from '@hey-api/openapi-ts';
import { defineConfig } from '@hey-api/openapi-ts';

function serviceConfig(name: string): UserConfig {
  return {
    input: `src/${name}/openapi.json`,
    output: {
      format: 'prettier',
      lint: 'eslint',
      path: `src/${name}/generated`,
    },
  };
}

export default defineConfig([
  serviceConfig('vda5050-master'),
  serviceConfig('rts'),
  serviceConfig('map'),
  serviceConfig('plan-server'),
  serviceConfig('plan-executor'),
]);
