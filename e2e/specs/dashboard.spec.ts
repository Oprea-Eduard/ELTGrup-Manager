import { test, expect } from "@playwright/test";

test.describe("Panou Operational", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/panou");
    await page.waitForSelector("text=Panou operational", { timeout: 10000 });
  });

  test(" afiseaza KPI-urile principale", async ({ page }) => {
    const kpis = ["Proiecte active", "Lucrari intarziate", "Pontaje active", "Cereri materiale", "Creante neincasate"];
    for (const label of kpis) {
      await expect(page.locator(`text=${label}`).first()).toBeVisible();
    }
  });

  test(" navigarea catre module functioneaza", async ({ page }) => {
    await page.click("text=Proiecte");
    await expect(page.locator("text=Proiecte")).toBeVisible();

    await page.click("text=Lucrari");
    await expect(page.locator("text=Lucrari")).toBeVisible();
  });

  test(" Command Palette se deschide cu Ctrl+K", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await expect(page.locator("[role='dialog']")).toBeVisible({ timeout: 3000 });
  });
});
