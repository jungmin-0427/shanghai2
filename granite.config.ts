import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'shanghaikok',
  brand: {
    displayName: '상하이콕',
    primaryColor: '#D4271B',
    icon: '',
  },
  web: {
    host: 'localhost',
    port: 3000,
    commands: {
      dev: 'next dev --turbopack',
      build: 'node scripts/build-toss.mjs',
    },
  },
  permissions: [],
  outdir: 'dist',
});
