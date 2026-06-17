import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        // Use our hand-crafted sw.js in /public — no auto-generation
        strategies: 'injectManifest',
        srcDir: 'public',
        filename: 'sw.js',
        injectManifest: {
          // Don't inject a precache manifest into our custom sw.js
          injectionPoint: undefined,
        },
        manifest: false, // we supply /public/manifest.json ourselves
        devOptions: {
          enabled: false, // keep dev server simple
        },
      }),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
