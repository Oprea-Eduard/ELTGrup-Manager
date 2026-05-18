import { expect, test } from "@playwright/test";
import { LoginPage } from "../pages/login.page";

/**
 * Teste RBAC — verifica ca utilizatorii fara permisiuni sa fie blocati
 * sau redirectionati la modulul default.
 *
 * Aceste teste necesita credential-uri pentru un WORKER in .env:
 * E2E_WORKER_EMAIL, E2E_WORKER_PASSWORD
 */
test.describe("RBAC - Role Based Access Control", () => {
	test.use({ storageState: { cookies: [], origins: [] } });

	test(" worker nu poate accesa setarile", async ({ page, baseURL }) => {
		const workerEmail = process.env.E2E_WORKER_EMAIL;
		const workerPass = process.env.E2E_WORKER_PASSWORD;

		test.skip(!workerEmail || !workerPass, "Worker credentials not configured");

		const login = new LoginPage(page);
		await login.login(workerEmail as string, workerPass as string);

		const url = baseURL || "http://localhost:3000";
		await page.goto(`${url}/setari`);

		// Ar trebui redirectat la pagina default (panou sau alt modul vizibil)
		await expect(page).not.toHaveURL(/\/setari/, { timeout: 5000 });
	});

	test(" worker poate accesa pontajul", async ({ page, baseURL }) => {
		const workerEmail = process.env.E2E_WORKER_EMAIL;
		const workerPass = process.env.E2E_WORKER_PASSWORD;

		test.skip(!workerEmail || !workerPass, "Worker credentials not configured");

		const login = new LoginPage(page);
		await login.login(workerEmail as string, workerPass as string);

		const url = baseURL || "http://localhost:3000";
		await page.goto(`${url}/pontaj`);
		await expect(page.locator("text=Pontaj").first()).toBeVisible({
			timeout: 7000,
		});
	});
});
