import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    testTimeout: 30000,
    maxWorkers: 1,
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/setup.ts"],
    coverage: {
      provider: "v8",
      include: [
        "src/math.ts",
        "src/learning.ts",
        "src/schemas.ts",
        "src/sync/merge.ts",
        "src/sync/protocol.ts",
      ],
      thresholds: { lines: 75, functions: 80, branches: 65 },
    },
  },
});
