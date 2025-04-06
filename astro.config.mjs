// astro.config.mts
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import solidJs from '@astrojs/solid-js';
import createMySQLAdapter from './src/db/mysql-adapter';
import node from '@astrojs/node';
export default defineConfig({
  output: 'server',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    solidJs(),
    createMySQLAdapter()
  ],

  adapter: node({
    mode: 'standalone',
  }),
});