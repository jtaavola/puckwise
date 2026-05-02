import { defineConfig } from "vitest/config";

const runIntegrationTests = process.env.NHL_API_INTEGRATION_TESTS === "1";

export default defineConfig({
	test: {
		environment: "node",
		exclude: runIntegrationTests ? [] : ["test/**/*.integration.test.ts"],
		include: [
			runIntegrationTests
				? "test/**/*.integration.test.ts"
				: "test/**/*.test.ts",
		],
	},
});
