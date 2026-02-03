/*   import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

 server: {
  // completely disable Hot Module Reload → no more “connection lost” polling
  hmr: false
 }

})   */

 // vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5176,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      clientPort: 5176,
    },
  },
});
