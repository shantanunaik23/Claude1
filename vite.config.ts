import { defineConfig } from 'vite';

// GitHub Pages serves this project from https://<user>.github.io/Claude1/.
// The workflow overrides BASE_PATH so a rename or a custom domain needs no code change.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/Claude1/',
});
