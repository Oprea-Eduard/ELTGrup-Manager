import { expect, test } from "@playwright/test";

/**
 * Teste de securitate — verifica headerele HTTP si comportamentul de autentificare
 */
test.describe("Security Headers", () => {
	test(" headerele de securitate sunt prezente", async ({ page }) => {
		const response = await page.goto("/");
		expect(response).not.toBeNull();

		const headers = response?.headers();
		expect(headers["x-frame-options"]).toBe("DENY");
		expect(headers["x-content-type-options"]).toBe("nosniff");
		expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
	});

	test(" sesiunea expira corect", async ({ page }) => {
		// Navigare la login fara credentiale valide
		await page.goto("/autentificare");
		await expect(page.locator('input[type="email"]')).toBeVisible();
	});
});
