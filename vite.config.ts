import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Public anon key (safe for the browser). Used as a fallback because Vercel
// Git builds often omit committed `.env` files, which left production with
// an empty apikey header.
const FALLBACK_SUPABASE_URL = "https://riguxshscsoygimxzwaf.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZ3V4c2hzY3NveWdpbXh6d2FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMTI0MjksImV4cCI6MjA4MzY4ODQyOX0.eJVclna93A2tUvPG867ZDDDZmKfLWYm0sH0SykDU_wk";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const supabaseUrl = env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const supabaseKey =
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    FALLBACK_SUPABASE_ANON_KEY;

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(supabaseKey),
    },
  };
});
