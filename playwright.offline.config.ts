import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "offline.spec.ts",
  outputDir: "test-results/offline",
  timeout: 90000,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4174",
    serviceWorkers: "allow",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node scripts/preview-test.mjs 4174 dist-offline",
    url: "http://127.0.0.1:4174",
    timeout: 240000,
    reuseExistingServer: false,
  },
});
