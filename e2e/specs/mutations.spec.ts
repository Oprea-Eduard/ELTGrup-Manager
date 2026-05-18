import { expect, test } from "@playwright/test";

test.describe("Mutatii de Business Core", () => {
	test("creare proiect nou cu succes", async ({ page }) => {
		await page.goto("/proiecte");

		// click pe butonul de deschidere modal
		await page
			.getByRole("button", { name: "Adauga proiect", exact: true })
			.click();

		const modal = page.getByRole("dialog");
		await expect(modal).toBeVisible();

		await modal
			.locator('input[name="title"]')
			.fill(`Proiect E2E Test - ${Date.now()}`);

		const clientSelect = modal.locator('select[name="clientId"]');
		const clientOptions = await clientSelect
			.locator("option")
			.allTextContents();
		if (clientOptions.length > 1) {
			await clientSelect.selectOption({ index: 1 });
		}

		await modal
			.locator('input[name="siteAddress"]')
			.fill("Strada E2E Test Nr. 123");
		await modal.locator('input[name="contractValue"]').fill("15000");
		await modal.locator('input[name="estimatedBudget"]').fill("10000");

		await modal
			.getByRole("button", { name: "Creeaza proiect", exact: true })
			.click();

		await expect(
			page.locator("text=Acțiune finalizată cu succes."),
		).toBeVisible({ timeout: 10000 });
	});

	test("creare lucrare (work order) noua cu succes", async ({ page }) => {
		await page.goto("/lucrari");

		await page
			.getByRole("button", { name: "Adauga ordin de lucru", exact: true })
			.click();

		const modal = page.getByRole("dialog");
		await expect(modal).toBeVisible();

		await modal
			.locator('input[name="title"]')
			.fill(`Lucrare E2E Test - ${Date.now()}`);

		const projectSelect = modal.locator('select[name="projectId"]');
		const projectOptions = await projectSelect
			.locator("option")
			.allTextContents();
		if (projectOptions.length > 1) {
			await projectSelect.selectOption({ index: 1 });
		}

		await modal
			.getByRole("button", { name: "Adauga lucrare", exact: true })
			.click();

		await expect(
			page.locator("text=Acțiune finalizată cu succes."),
		).toBeVisible({ timeout: 10000 });
	});

	test("inregistrare pontaj nou cu succes", async ({ page }) => {
		await page.goto("/pontaj");

		await page
			.getByRole("button", { name: "Adauga pontaj", exact: true })
			.click();

		const modal = page.getByRole("dialog");
		await expect(modal).toBeVisible();

		const projectSelect = modal.locator('select[name="projectId"]');
		const projectOptions = await projectSelect
			.locator("option")
			.allTextContents();
		if (projectOptions.length > 1) {
			await projectSelect.selectOption({ index: 1 });
		}

		await modal.locator('input[name="startDate"]').fill("2026-05-04");
		await modal.locator('input[name="startTime"]').fill("08:00");

		await modal
			.getByRole("button", { name: "Trimite pontaj", exact: true })
			.click();

		await expect(
			page.locator("text=Pontaj inregistrat cu succes."),
		).toBeVisible({ timeout: 10000 });
	});
});
