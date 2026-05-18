import { expect, type Page } from "@playwright/test";

export class DashboardPage {
	constructor(private page: Page) {}

	async goto() {
		await this.page.goto("/panou");
	}

	async expectLoaded() {
		await expect(
			this.page.locator("h1:has-text('Panou operational')"),
		).toBeVisible({ timeout: 10000 });
	}

	getKpiCards() {
		return this.page.locator("[data-testid='kpi-card']");
	}

	getNavigationLinks() {
		return this.page.locator("nav a");
	}

	async clickModule(moduleName: string) {
		await this.page.click(`nav a:has-text("${moduleName}")`);
	}

	async openCommandPalette() {
		await this.page.keyboard.press("Control+k");
	}

	getCommandPalette() {
		return this.page.locator("[data-testid='command-palette']");
	}
}
