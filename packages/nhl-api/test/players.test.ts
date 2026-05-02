import { describe, expect, it, vi } from "vitest";
import {
	createNhlApiClient,
	playerGameLogSchema,
	playerLandingSchema,
	playerSpotlightSchema,
	statsGoalieStatsResponseSchema,
	statsLeadersResponseSchema,
	statsMilestonesResponseSchema,
	statsPlayerInfoResponseSchema,
	statsSkaterStatsResponseSchema,
} from "../src/index.js";
import {
	playerGameLogFixture,
	playerLandingGoalieFixture,
	playerLandingSkaterFixture,
	playerSpotlightFixture,
	statsGoalieStatsFixture,
	statsLeaderFixture,
	statsMilestoneFixture,
	statsPlayerInfoFixture,
	statsSkaterStatsFixture,
} from "./fixtures/players.js";

function jsonResponse(data: unknown): Response {
	return new Response(JSON.stringify(data), {
		headers: { "content-type": "application/json" },
		status: 200,
	});
}

describe("players domain schemas", () => {
	it("parses player landing fixtures for an active skater and goalie", () => {
		expect(playerLandingSchema.parse(playerLandingSkaterFixture)).toMatchObject({
			currentTeamAbbrev: "EDM",
			playerId: 8478402,
			positionCode: "C",
		});
		expect(playerLandingSchema.parse(playerLandingGoalieFixture)).toMatchObject({
			currentTeamAbbrev: "WPG",
			playerId: 8476999,
			positionCode: "G",
		});
	});

	it("parses player game log, Stats API, and spotlight fixtures", () => {
		expect(playerGameLogSchema.parse(playerGameLogFixture).gameLog).toHaveLength(1);
		expect(statsPlayerInfoResponseSchema.parse(statsPlayerInfoFixture).data[0]).toMatchObject({
			playerId: 8478402,
		});
		expect(statsSkaterStatsResponseSchema.parse(statsSkaterStatsFixture).data[0]).toMatchObject({
			points: 132,
		});
		expect(statsGoalieStatsResponseSchema.parse(statsGoalieStatsFixture).data[0]).toMatchObject({
			wins: 37,
		});
		expect(statsLeadersResponseSchema.parse(statsLeaderFixture).data[0]).toMatchObject({
			rank: 1,
		});
		expect(statsMilestonesResponseSchema.parse(statsMilestoneFixture).data[0]).toMatchObject({
			milestone: "Assists",
		});
		expect(playerSpotlightSchema.parse(playerSpotlightFixture).players[0]).toMatchObject({
			playerId: 8478402,
		});
	});
});

describe("players domain client", () => {
	it("uses Web API endpoints for landing, game logs, and spotlight", async () => {
		const requests: string[] = [];
		const fetch = vi.fn(async (input: RequestInfo | URL) => {
			requests.push(input.toString());
			const pathname = new URL(input.toString()).pathname;

			if (pathname.includes("/game-log/")) {
				return jsonResponse(playerGameLogFixture);
			}

			if (pathname.includes("/leaders/")) {
				return jsonResponse(statsLeaderFixture);
			}

			if (pathname.includes("/player-spotlight")) {
				return jsonResponse(playerSpotlightFixture);
			}

			return jsonResponse(playerLandingSkaterFixture);
		});
		const client = createNhlApiClient({ fetch });

		await client.players.getLanding(8478402);
		await client.players.getGameLog(8478402, {
			gameType: 2,
			season: 20232024,
		});
		await client.players.getSkaterLeaders({ attribute: "points", limit: 5 });
		await client.players.getGoalieLeaders({ attribute: "wins", limit: 3 });
		await client.players.getSpotlight();

		expect(requests).toEqual([
			"https://api-web.nhle.com/v1/player/8478402/landing",
			"https://api-web.nhle.com/v1/player/8478402/game-log/20232024/2",
			"https://api.nhle.com/stats/rest/en/leaders/skaters/points?limit=5",
			"https://api.nhle.com/stats/rest/en/leaders/goalies/wins?limit=3",
			"https://api-web.nhle.com/v1/player-spotlight",
		]);
	});

	it("uses Stats API endpoints and deterministic cayenne filters for search and stats", async () => {
		const requests: URL[] = [];
		const fetch = vi.fn(async (input: RequestInfo | URL) => {
			const url = new URL(input.toString());
			requests.push(url);

			if (url.pathname.includes("/goalie/")) {
				return jsonResponse(statsGoalieStatsFixture);
			}

			if (url.pathname.includes("/skater/")) {
				return jsonResponse(statsSkaterStatsFixture);
			}

			if (url.pathname.includes("/milestones/")) {
				return jsonResponse(statsMilestoneFixture);
			}

			return jsonResponse(statsPlayerInfoFixture);
		});
		const client = createNhlApiClient({ fetch });

		await client.players.search({
			currentTeamId: 22,
			limit: 10,
			positionCode: "C",
			sort: "lastName",
		});
		await client.players.getInfo(8478402);
		await client.players.getSkaterStats({
			dir: "desc",
			gameType: 2,
			limit: 5,
			positionCode: "C",
			report: "summary",
			season: 20232024,
			sort: "points",
			teamId: 22,
		});
		await client.players.getGoalieStats({
			gameType: 2,
			playerId: 8476999,
			report: "summary",
			season: 20232024,
			sort: "wins",
		});
		await client.players.getMilestones({ kind: "skaters", limit: 5 });

		expect(requests.map((url) => url.pathname)).toEqual([
			"/stats/rest/en/players",
			"/stats/rest/en/players",
			"/stats/rest/en/skater/summary",
			"/stats/rest/en/goalie/summary",
			"/stats/rest/en/milestones/skaters",
		]);
		expect(requests[0]?.searchParams.get("cayenneExp")).toBe(
			'currentTeamId=22 and positionCode="C"',
		);
		expect(requests[0]?.searchParams.get("limit")).toBe("10");
		expect(requests[0]?.searchParams.get("sort")).toBe("lastName");
		expect(requests[1]?.searchParams.get("cayenneExp")).toBe("id=8478402");
		expect(requests[2]?.searchParams.get("cayenneExp")).toBe(
			'gameTypeId=2 and positionCode="C" and seasonId=20232024 and teamId=22',
		);
		expect(requests[2]?.searchParams.get("dir")).toBe("desc");
		expect(requests[2]?.searchParams.get("limit")).toBe("5");
		expect(requests[2]?.searchParams.get("sort")).toBe("points");
		expect(requests[3]?.searchParams.get("cayenneExp")).toBe(
			"gameTypeId=2 and playerId=8476999 and seasonId=20232024",
		);
		expect(requests[4]?.searchParams.get("limit")).toBe("5");
	});

	it("rejects Stats API languages that would alter the endpoint path", () => {
		const client = createNhlApiClient({
			fetch: vi.fn(async () => jsonResponse(statsPlayerInfoFixture)),
		});

		expect(() => client.players.getInfo(8478402, { lang: "../fr" })).toThrow(
			/Invalid Stats API language/,
		);
		expect(() => client.players.getInfo(8478402, { lang: "fr/players" })).toThrow(
			/Invalid Stats API language/,
		);
	});
});
