import { defineConfig } from "vitest/config";

export default defineConfig({
  define: {
    "import.meta.vitest": "undefined",
  },
  test: {
    dir: "src",
    includeSource: ["src/**/*.{js,ts}"],
    setupFiles: ["./testSetUp.ts"],
  },
});
