// astro.config.mts
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import solidJs from '@astrojs/solid-js';
import createMySQLAdapter from './src/db/mysql-adapter';
export default defineConfig({
  output: 'server',
  vite: {
    plugins: [tailwindcss()]
  },
  integrations: [
    solidJs(),
    createMySQLAdapter()
  ],
});