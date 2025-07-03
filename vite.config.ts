
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    watch: {
      usePolling: false,
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/coverage/**', '**/build/**']
    },
    proxy: {
      '/api': {
        target: 'https://fortem-dashboard.lovable.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  plugins: [
    react({
      // Explicit JSX runtime configuration
      jsxRuntime: 'automatic',
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['fsevents'],
    include: ['react', 'react-dom'],
    force: true,
  },
  build: {
    rollupOptions: {
      external: ['fsevents']
    }
  },
  esbuild: {
    // Ensure JSX is handled correctly
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  },
}));
