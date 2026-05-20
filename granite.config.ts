import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'shanghaikok',
  brand: {
    displayName: '상하이콕',
    primaryColor: '#D4271B',
    icon: '',
  },
  web: {
    host: '192.168.0.7',
    port: 3000,
    commands: {
      dev: 'next dev --turbopack --hostname 0.0.0.0',
      build: 'node scripts/build-toss.mjs',
    },
  },
  permissions: [],
  outdir: 'dist',
});
