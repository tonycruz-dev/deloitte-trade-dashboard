import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from "@tailwindcss/vite";
import mkcert from "vite-plugin-mkcert";

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: "../Deloitte.TradeDashboard.Api/wwwroot",
    chunkSizeWarningLimit: 2000,
    emptyOutDir: true,
  },
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  plugins: [
    react(),
    tailwindcss(),
    mkcert(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  server: {
    port: 3000,
  },
});
