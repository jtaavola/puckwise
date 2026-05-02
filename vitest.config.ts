import { configDefaults, defineConfig } from "vitest/config";

const runIntegrationTests = process.env.PUCKWISE_INTEGRATION_TESTS === "1";

export default defineConfig({
	test: {
		exclude: runIntegrationTests
			? configDefaults.exclude
			: [...configDefaults.exclude, "**/*.integration.test.ts"],
		include: [
			runIntegrationTests ? "**/*.integration.test.ts" : "**/*.{test,spec}.?(c|m)[jt]s?(x)",
		],
	},
});
