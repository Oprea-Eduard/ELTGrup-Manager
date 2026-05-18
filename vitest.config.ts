import os from "node:os";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "."),
		},
	},
	test: {
		environment: "node",
		globals: true,
		include: ["src/**/*.test.ts", "app/**/*.test.ts"],
		coverage: {
			provider: "v8",
			include: ["src/**/*.{ts,tsx}", "app/**/*.{ts,tsx}"],
			exclude: ["**/*.test.{ts,tsx}", "**/*.d.ts", "app/sw.ts", "src/types/**"],
			reporter: ["text", "lcov", "html"],
			thresholds: {
				statements: 30,
				branches: 20,
				functions: 25,
				lines: 30,
			},
		},
		maxConcurrency: Math.min(6, Math.max(2, os.cpus().length - 1)),
		reporters:
			process.env.VITEST_HTML_REPORT === "true"
				? ["default", "html"]
				: ["default"],
	},
});
