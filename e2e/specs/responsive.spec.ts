import { test, expect } from "@playwright/test";

/**
 * Teste de responsive design — verifica layout-ul pe mobile si tablet
 */
test.describe("Responsive Design", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test(" mobile menu se afiseaza pe ecran mic", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/panou");
    await page.waitForSelector("text=Panou operational", { timeout: 10000 });

    // Hamburger menu / mobile nav drawer trigger
    const mobileMenuTrigger = page.getByLabel("Deschide meniul");
    if (await mobileMenuTrigger.isVisible().catch(() => false)) {
      await mobileMenuTrigger.click();
      await expect(page.getByRole("navigation").filter({ hasText: "Operare" })).toBeVisible();
      await expect(page.getByRole("navigation").filter({ hasText: "Operare" })).toHaveJSProperty("clientHeight", 667 - 73);
    }
  });

  test(" tabelul de proiecte este scrollabil pe mobil", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/proiecte");
    await page.waitForTimeout(2000);

    const scrollable = page.locator("table, [class*='overflow']").first();
    if (await scrollable.isVisible().catch(() => false)) {
      const box = await scrollable.boundingBox();
      expect(box?.width).toBeLessThanOrEqual(375);
    }
  });

  test(" dashboard se incarca corect pe tablet", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/panou");
    await page.waitForSelector("text=Panou operational", { timeout: 10000 });

    await expect(page.getByText("Proiecte active", { exact: true })).toBeVisible();
    await expect(page.locator("text=Ore facturabile pe proiect")).toBeVisible();
  });
});
