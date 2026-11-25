import { build } from 'vite';

// Bundle the installed Three.js locally so classroom phones need no CDN access.
await build({
  configFile: false,
  publicDir: false,
  logLevel: 'warn',
  build: {
    outDir: 'public/battle14',
    emptyOutDir: false,
    lib: {
      entry: 'app/battle14/client/arena-view.js',
      formats: ['es'],
      fileName: () => 'arena-view.js',
    },
    minify: 'esbuild',
  },
});
