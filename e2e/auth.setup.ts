import { test as setup } from "@playwright/test";

const authFile = "e2e/.auth/user.json";

setup("authenticate", async ({ page, baseURL }) => {
  const url = baseURL || "http://localhost:3000";
  await page.goto(`${url}/autentificare`);
  await page.waitForSelector('input[type="email"]');

  await page.fill('input[type="email"]', process.env.E2E_USER_EMAIL || "admin@eltgrup.local");
  await page.fill('input[type="password"]', process.env.E2E_USER_PASSWORD || "admin123");
  await page.click('button[type="submit"]');

  await page.waitForURL(`${url}/panou`, { timeout: 30000 });
  await page.context().storageState({ path: authFile });
});
