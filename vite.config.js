import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    open: true,
    host: true,
  },
  build: {
    target: 'esnext',

  },
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.ktx2'],
});
