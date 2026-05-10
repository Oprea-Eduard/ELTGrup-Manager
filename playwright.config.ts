import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const unauthenticatedSpecs = /.*\/(login|security)\.spec\.ts$/;
const authState = "e2e/.auth/user.json";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    headless: true,
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts$/ },
    {
      name: "unauthenticated",
      testMatch: unauthenticatedSpecs,
      use: { ...devices["Desktop Chrome"], storageState: { cookies: [], origins: [] } },
    },
    {
      name: "chromium",
      testIgnore: unauthenticatedSpecs,
      use: { ...devices["Desktop Chrome"], storageState: authState },
      dependencies: ["setup"],
    },
    {
      name: "Mobile Chrome",
      testIgnore: [unauthenticatedSpecs, /.*\/mutations\.spec\.ts$/],
      use: { ...devices["Pixel 5"], storageState: authState },
      dependencies: ["setup"],
    },
  ],
});
