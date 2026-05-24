import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./generated",
  use: {
    baseURL: "http://127.0.0.1:4004",
    headless: true,
  },
  webServer: {
    command: "npm run demo:ui",
    url: "http://127.0.0.1:4004/movies",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
