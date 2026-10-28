import { defineConfig, devices } from "@playwright/test";

// Адрес приложения — только из окружения: APP_URL=http://localhost:8080 make test.
const appUrl = process.env.APP_URL;
if (!appUrl) {
  throw new Error("Задайте адрес приложения в переменной окружения APP_URL");
}

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: 15_000,
  expect: { timeout: 5_000 },
  outputDir: "tmp/test-results",
  reporter: [["list"], ["html", { outputFolder: "tmp/playwright-report", open: "never" }]],
  use: {
    baseURL: appUrl,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
