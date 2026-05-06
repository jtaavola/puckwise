import { describe, expect, it } from "vitest";
import { createNhlApiClient } from "../src/index.js";

const client = createNhlApiClient({ timeoutMs: 15_000 });

describe("NHL API live integration", () => {
	it(
		"fetches and validates Web API player landing data",
		async () => {
			const landing = await client.players.getLanding(8478402);

			expect(landing.playerId).toBe(8478402);
			expect(landing.firstName).toMatchObject({ default: "Connor" });
			expect(landing.lastName).toMatchObject({ default: "McDavid" });
			expect(landing.positionCode).toBe("C");
			expect(landing.seasonTotals?.length).toBeGreaterThan(0);
		},
		20_000,
	);

	it(
		"fetches and validates Web API player game logs",
		async () => {
			const gameLog = await client.players.getGameLog(8478402, {
				gameType: 2,
				season: 20232024,
			});

			expect(gameLog.seasonId).toBe(20232024);
			expect(gameLog.gameTypeId).toBe(2);
			expect(gameLog.gameLog?.length).toBeGreaterThan(0);
			expect(gameLog.gameLog?.[0]).toMatchObject({
				teamAbbrev: "EDM",
			});
			expect(gameLog.gameLog?.[0]?.gameId?.toString()).toMatch(/^2023/);
		},
		20_000,
	);

	it(
		"fetches and validates Web API player game log as of now",
		async () => {
			const gameLog = await client.players.getGameLogNow(8478402);

			expect(gameLog.gameLog?.length).toBeGreaterThan(0);
			expect(gameLog.gameLog?.[0]).toMatchObject({
				teamAbbrev: "EDM",
			});
		},
		20_000,
	);

	it(
		"fetches and validates Stats API player info and season stats",
		async () => {
			const [info, skaterStats, goalieStats] = await Promise.all([
				client.players.getInfo(8478402),
				client.players.getSkaterStats({
					gameType: 2,
					playerId: 8478402,
					season: 20232024,
				}),
				client.players.getGoalieStats({
					gameType: 2,
					playerId: 8476999,
					season: 20232024,
				}),
			]);

			expect(info.data).toEqual([
				expect.objectContaining({
					firstName: "Connor",
					lastName: "McDavid",
					playerId: 8478402,
				}),
			]);
			expect(skaterStats.data[0]).toMatchObject({
				playerId: 8478402,
				seasonId: 20232024,
			});
			expect(skaterStats.data[0]?.points).toBeGreaterThan(0);
			expect(goalieStats.data[0]).toMatchObject({
				playerId: 8476999,
				seasonId: 20232024,
			});
			expect(goalieStats.data[0]?.wins).toBeGreaterThan(0);
		},
		20_000,
	);

	it("fetches and validates a live Stats API milestone list", async () => {
		const milestones = await client.players.getMilestones({
			kind: "skaters",
			limit: 5,
		});

		expect(milestones.data.length).toBeGreaterThan(0);
		expect(milestones.data[0]?.milestone).toEqual(expect.any(String));
		expect(milestones.data[0]?.milestoneAmount).toBeGreaterThan(0);
	}, 20_000);
});
