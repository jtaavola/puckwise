import { describe, expect, it } from "vitest";
import { createNhlApiClient } from "../src/index.js";

describe("players domain live client integration", () => {
	const client = createNhlApiClient({ timeoutMs: 15_000 });

	it("parses live Web API player responses through the client", async () => {
		await expect(client.players.getLanding(8478402)).resolves.toBeDefined();
		await expect(client.players.getLanding(8476999)).resolves.toBeDefined();
		await expect(
			client.players.getGameLog(8478402, {
				gameType: 2,
				season: 20242025,
			}),
		).resolves.toBeDefined();
		await expect(client.players.getSpotlight()).resolves.toBeDefined();
	});

	it("parses live Stats API player responses through the client", async () => {
		await expect(client.players.getInfo(8478402)).resolves.toBeDefined();
		await expect(
			client.players.search({
				firstName: "Connor",
				lastName: "McDavid",
				limit: 1,
			}),
		).resolves.toBeDefined();
		await expect(
			client.players.getSkaterStats({
				gameType: 2,
				limit: 1,
				playerId: 8478402,
				season: 20242025,
			}),
		).resolves.toBeDefined();
		await expect(
			client.players.getSkaterStats({
				gameType: 3,
				limit: 1,
				playerId: 8478402,
				season: 20242025,
			}),
		).resolves.toBeDefined();
		await expect(
			client.players.getGoalieStats({
				gameType: 2,
				limit: 1,
				playerId: 8476945,
				season: 20242025,
			}),
		).resolves.toBeDefined();
		await expect(
			client.players.getGoalieStats({
				gameType: 3,
				limit: 1,
				playerId: 8476945,
				season: 20242025,
			}),
		).resolves.toBeDefined();
		await expect(
			client.players.getMilestones({ kind: "skaters", limit: 3 }),
		).resolves.toBeDefined();
	});
});
