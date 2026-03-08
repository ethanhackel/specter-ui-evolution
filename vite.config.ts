import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  define: {
    // Fallback values for production build if .env is not available
    // These are publishable/anon keys, safe to include in client code
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
      process.env.VITE_SUPABASE_URL || "https://godwqsjgxzbrafmmvhod.supabase.co"
    ),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvZHdxc2pneHpicmFmbW12aG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5ODcxODUsImV4cCI6MjA4ODU2MzE4NX0.lTu69F92jth6xZUaxWFbKH1mvr3njca2tciUZ-aoMZw"
    ),
  },
  build: {
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
