import { describe, expect, it } from "vitest";
import type { z } from "zod";
import {
	playerGameLogSchema,
	playerLandingSchema,
	playerSpotlightSchema,
	statsGoalieStatsResponseSchema,
	statsMilestonesResponseSchema,
	statsPlayerInfoResponseSchema,
	statsSkaterStatsResponseSchema,
} from "../src/index.js";

const WEB_BASE_URL = "https://api-web.nhle.com/v1";
const STATS_BASE_URL = "https://api.nhle.com/stats/rest/en";

describe("players domain live schema integration", () => {
	it("parses live Web API player responses", async () => {
		await expectResponseToParse(
			`${WEB_BASE_URL}/player/8478402/landing`,
			playerLandingSchema,
		);
		await expectResponseToParse(
			`${WEB_BASE_URL}/player/8476999/landing`,
			playerLandingSchema,
		);
		await expectResponseToParse(
			`${WEB_BASE_URL}/player/8478402/game-log/20242025/2`,
			playerGameLogSchema,
		);
		await expectResponseToParse(
			`${WEB_BASE_URL}/player-spotlight`,
			playerSpotlightSchema,
		);
	});

	it("parses live Stats API player responses", async () => {
		const playerById = await expectResponseToParse(
			`${STATS_BASE_URL}/players?cayenneExp=id=8478402&limit=1`,
			statsPlayerInfoResponseSchema,
		);
		const playerByName = await expectResponseToParse(
			`${STATS_BASE_URL}/players?cayenneExp=firstName%3D%22Connor%22%20and%20lastName%3D%22McDavid%22&limit=1`,
			statsPlayerInfoResponseSchema,
		);
		const skaterStats = await expectResponseToParse(
			`${STATS_BASE_URL}/skater/summary?cayenneExp=gameTypeId=2%20and%20playerId=8478402%20and%20seasonId=20242025&limit=1`,
			statsSkaterStatsResponseSchema,
		);
		const playoffSkaterStats = await expectResponseToParse(
			`${STATS_BASE_URL}/skater/summary?cayenneExp=gameTypeId=3%20and%20playerId=8478402%20and%20seasonId=20242025&limit=1`,
			statsSkaterStatsResponseSchema,
		);
		const goalieStats = await expectResponseToParse(
			`${STATS_BASE_URL}/goalie/summary?cayenneExp=gameTypeId=2%20and%20playerId=8476945%20and%20seasonId=20242025&limit=1`,
			statsGoalieStatsResponseSchema,
		);
		const playoffGoalieStats = await expectResponseToParse(
			`${STATS_BASE_URL}/goalie/summary?cayenneExp=gameTypeId=3%20and%20playerId=8476945%20and%20seasonId=20242025&limit=1`,
			statsGoalieStatsResponseSchema,
		);
		const milestones = await expectResponseToParse(
			`${STATS_BASE_URL}/milestones/skaters?limit=3`,
			statsMilestonesResponseSchema,
		);

		expect(playerById.data).toHaveLength(1);
		expect(playerById.data[0]).toMatchObject({
			playerId: 8478402,
		});
		expect(playerByName.data).toHaveLength(1);
		expect(playerByName.data[0]).toMatchObject({
			firstName: "Connor",
			lastName: "McDavid",
			playerId: 8478402,
		});
		expect(skaterStats.data).toHaveLength(1);
		expect(skaterStats.data[0]).toMatchObject({
			gamesPlayed: 67,
			playerId: 8478402,
			points: 100,
			seasonId: 20242025,
		});
		expect(playoffSkaterStats.data).toHaveLength(1);
		expect(playoffSkaterStats.data[0]).toMatchObject({
			gamesPlayed: 22,
			playerId: 8478402,
			points: 33,
			seasonId: 20242025,
		});
		expect(skaterStats.data[0]?.gamesPlayed).not.toBe(
			playoffSkaterStats.data[0]?.gamesPlayed,
		);
		expect(goalieStats.data).toHaveLength(1);
		expect(goalieStats.data[0]).toMatchObject({
			gamesPlayed: 63,
			playerId: 8476945,
			seasonId: 20242025,
			wins: 47,
		});
		expect(playoffGoalieStats.data).toHaveLength(1);
		expect(playoffGoalieStats.data[0]).toMatchObject({
			gamesPlayed: 13,
			playerId: 8476945,
			seasonId: 20242025,
			wins: 6,
		});
		expect(goalieStats.data[0]?.gamesPlayed).not.toBe(
			playoffGoalieStats.data[0]?.gamesPlayed,
		);
		expect(milestones.data.length).toBeLessThanOrEqual(3);
	});
});

async function expectResponseToParse<TSchema extends z.ZodType>(
	url: string,
	schema: TSchema,
): Promise<z.infer<TSchema>> {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`NHL API request failed: ${response.status} ${url}`);
	}

	return schema.parse(await response.json());
}
