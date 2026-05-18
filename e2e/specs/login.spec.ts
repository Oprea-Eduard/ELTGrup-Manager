import { expect, test } from "@playwright/test";
import { LoginPage } from "../pages/login.page";

test.describe("Autentificare", () => {
	test(" utilizator invalid vede mesaj de eroare", async ({ page }) => {
		const login = new LoginPage(page);
		await login.login("invalid@test.com", "wrongpassword");

		await expect(page.locator("text=Credentiale invalide")).toBeVisible({
			timeout: 5000,
		});
		await expect(page).toHaveURL(/\/autentificare/);
	});

	test(" utilizator valid ajunge pe panou dupa login", async ({
		page,
		baseURL,
	}) => {
		const login = new LoginPage(page);
		const url = baseURL || "http://localhost:3000";
		await login.login(
			process.env.E2E_USER_EMAIL || "admin@eltgrup.local",
			process.env.E2E_USER_PASSWORD || "admin123",
		);

		await page.waitForURL(`${url}/panou`, { timeout: 10000 });
		await expect(page.locator("text=Panou operational")).toBeVisible();
	});

	test(" redirecteaza la callbackUrl dupa autentificare", async ({
		page,
		baseURL,
	}) => {
		const url = baseURL || "http://localhost:3000";
		await page.goto(
			`${url}/autentificare?callbackUrl=${encodeURIComponent("/proiecte")}`,
		);
		const login = new LoginPage(page);
		await login.fillEmail(process.env.E2E_USER_EMAIL || "admin@eltgrup.local");
		await login.fillPassword(process.env.E2E_USER_PASSWORD || "admin123");
		await login.submit();

		await page.waitForURL(`${url}/proiecte`, { timeout: 10000 });
	});

	test(" accesul la rute protejate redirectioneaza la login", async ({
		page,
		baseURL,
	}) => {
		const url = baseURL || "http://localhost:3000";
		await page.goto(`${url}/panou`);
		await expect(page).toHaveURL(/\/autentificare/);
	});
});
