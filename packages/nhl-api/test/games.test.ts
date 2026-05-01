import { describe, expect, it, vi } from "vitest";
import {
	createNhlApiClient,
	gameBoxscoreSchema,
	gameLandingSchema,
	gamePlayByPlaySchema,
	gameStorySchema,
	oddsResponseSchema,
	replayResponseSchema,
	scoreboardResponseSchema,
	scoresResponseSchema,
	statsGameInfoResponseSchema,
	statsGameMetadataResponseSchema,
	statsShiftChartsResponseSchema,
	streamsResponseSchema,
	tvScheduleResponseSchema,
	wscPlayByPlayResponseSchema,
} from "../src/index.js";
import {
	boxscoreFixture,
	landingFixture,
	oddsFixture,
	playByPlayFixture,
	replayFixture,
	scoreboardFixture,
	scoresFixture,
	shiftChartsFixture,
	statsGameInfoFixture,
	statsGameMetadataFixture,
	storyFixture,
	streamsFixture,
	tvScheduleFixture,
	wscPlayByPlayFixture,
} from "./fixtures/games.js";

function jsonResponse(data: unknown): Response {
	return new Response(JSON.stringify(data), {
		headers: { "content-type": "application/json" },
		status: 200,
	});
}

describe("games domain schemas", () => {
	it("parses scheduled/live-style scores and final game payloads", () => {
		expect(scoresResponseSchema.parse(scoresFixture).games[0]).toMatchObject({
			gameId: 2023030417,
			gameState: "OFF",
		});
		expect(scoreboardResponseSchema.parse(scoreboardFixture).gamesByDate?.[0]).toMatchObject({
			date: "2026-01-15",
		});
	});

	it("parses gamecenter, Stats API, and auxiliary game fixtures", () => {
		expect(gameLandingSchema.parse(landingFixture)).toMatchObject({
			gameId: 2023030417,
		});
		expect(gameBoxscoreSchema.parse(boxscoreFixture).awayTeam.forwards).toHaveLength(1);
		expect(gamePlayByPlaySchema.parse(playByPlayFixture).plays[0]).toMatchObject({
			typeDescKey: "goal",
		});
		expect(gameStorySchema.parse(storyFixture).modules).toHaveLength(1);
		expect(statsGameInfoResponseSchema.parse(statsGameInfoFixture).data[0]).toMatchObject({
			gameTypeId: 3,
		});
		expect(statsGameMetadataResponseSchema.parse(statsGameMetadataFixture).data).toHaveLength(1);
		expect(statsShiftChartsResponseSchema.parse(shiftChartsFixture).data[0]).toMatchObject({
			playerId: 8478402,
		});
		expect(streamsResponseSchema.parse(streamsFixture)).toMatchObject({ countries: expect.any(Array) });
		expect(tvScheduleResponseSchema.parse(tvScheduleFixture)).toMatchObject({ date: "2024-06-24" });
		expect(oddsResponseSchema.parse(oddsFixture)).toMatchObject({ countryCode: "US" });
		expect(replayResponseSchema.parse(replayFixture)).toMatchObject({ eventNumber: 12 });
		expect(wscPlayByPlayResponseSchema.parse(wscPlayByPlayFixture)).toMatchObject({
			gameId: 2023030417,
		});
	});
});

describe("games domain client", () => {
	it("uses Web API game endpoints and date-based score queries", async () => {
		const requests: string[] = [];
		const fetch = vi.fn(async (input: RequestInfo | URL) => {
			const url = new URL(input.toString());
			requests.push(url.toString());

			if (url.pathname.includes("/scoreboard/")) {
				return jsonResponse(scoreboardFixture);
			}
			if (url.pathname.includes("/landing")) {
				return jsonResponse(landingFixture);
			}
			if (url.pathname.includes("/boxscore")) {
				return jsonResponse(boxscoreFixture);
			}
			if (url.pathname.includes("/play-by-play")) {
				return jsonResponse(playByPlayFixture);
			}
			if (url.pathname.includes("/game-story")) {
				return jsonResponse(storyFixture);
			}

			return jsonResponse(scoresFixture);
		});
		const client = createNhlApiClient({ fetch });

		await client.games.getScores({ date: "2024-06-24" });
		await client.games.getScores();
		await client.games.getScoreboard({ team: "min" });
		await client.games.getLanding(2023030417);
		await client.games.getBoxscore(2023030417);
		await client.games.getPlayByPlay(2023030417);
		await client.games.getStory(2023030417);

		expect(requests).toEqual([
			"https://api-web.nhle.com/v1/score/2024-06-24",
			"https://api-web.nhle.com/v1/score/now",
			"https://api-web.nhle.com/v1/scoreboard/MIN/now",
			"https://api-web.nhle.com/v1/gamecenter/2023030417/landing",
			"https://api-web.nhle.com/v1/gamecenter/2023030417/boxscore",
			"https://api-web.nhle.com/v1/gamecenter/2023030417/play-by-play",
			"https://api-web.nhle.com/v1/wsc/game-story/2023030417",
		]);
	});

	it("uses Stats API game and shift chart endpoints with cayenne filters", async () => {
		const requests: URL[] = [];
		const fetch = vi.fn(async (input: RequestInfo | URL) => {
			const url = new URL(input.toString());
			requests.push(url);

			if (url.pathname.endsWith("/game/meta")) {
				return jsonResponse(statsGameMetadataFixture);
			}
			if (url.pathname.endsWith("/shiftcharts")) {
				return jsonResponse(shiftChartsFixture);
			}

			return jsonResponse(statsGameInfoFixture);
		});
		const client = createNhlApiClient({ fetch });

		await client.games.getInfo({
			gameId: 2023030417,
			gameType: 3,
			season: 20232024,
			sort: "gameDate",
		});
		await client.games.getMetadata();
		await client.games.getShiftCharts({
			gameId: 2023030417,
			playerId: 8478402,
			teamAbbrev: "EDM",
		});

		expect(requests.map((url) => url.pathname)).toEqual([
			"/stats/rest/en/game",
			"/stats/rest/en/game/meta",
			"/stats/rest/en/shiftcharts",
		]);
		expect(requests[0]?.searchParams.get("cayenneExp")).toBe(
			"gameId=2023030417 and gameTypeId=3 and seasonId=20232024",
		);
		expect(requests[0]?.searchParams.get("sort")).toBe("gameDate");
		expect(requests[2]?.searchParams.get("cayenneExp")).toBe(
			'gameId=2023030417 and playerId=8478402 and teamAbbrev="EDM"',
		);
	});

	it("uses auxiliary stream, schedule, odds, replay, and WSC endpoints", async () => {
		const requests: string[] = [];
		const fetch = vi.fn(async (input: RequestInfo | URL) => {
			const url = new URL(input.toString());
			requests.push(url.toString());

			if (url.pathname.includes("/where-to-watch")) {
				return jsonResponse(streamsFixture);
			}
			if (url.pathname.includes("/tv-schedule")) {
				return jsonResponse(tvScheduleFixture);
			}
			if (url.pathname.includes("/partner-game")) {
				return jsonResponse(oddsFixture);
			}
			if (url.pathname.includes("/ppt-replay")) {
				return jsonResponse(replayFixture);
			}

			return jsonResponse(wscPlayByPlayFixture);
		});
		const client = createNhlApiClient({ fetch });

		await client.games.getStreams({ include: "providers" });
		await client.games.getTvSchedule({ date: new Date("2024-06-24T12:00:00.000Z") });
		await client.games.getOdds({ countryCode: "us" });
		await client.games.getReplays({
			eventNumber: 12,
			gameId: 2023030417,
			kind: "goal",
		});
		await client.games.getReplays({
			eventNumber: 13,
			gameId: 2023030417,
		});
		await client.games.getWscPlayByPlay({ gameId: 2023030417 });

		expect(requests).toEqual([
			"https://api-web.nhle.com/v1/where-to-watch?include=providers",
			"https://api-web.nhle.com/v1/network/tv-schedule/2024-06-24",
			"https://api-web.nhle.com/v1/partner-game/US/now",
			"https://api-web.nhle.com/v1/ppt-replay/goal/2023030417/12",
			"https://api-web.nhle.com/v1/ppt-replay/2023030417/13",
			"https://api-web.nhle.com/v1/wsc/play-by-play/2023030417",
		]);
	});

	it("rejects invalid dates and path parameters before fetch", () => {
		const client = createNhlApiClient({
			fetch: vi.fn(async () => jsonResponse(scoresFixture)),
		});

		expect(() => client.games.getScores({ date: "2024/06/24" })).toThrow(
			/Invalid game date/,
		);
		expect(() => client.games.getOdds({ countryCode: "usa" })).toThrow(
			/Invalid country code/,
		);
		expect(() =>
			client.games.getReplays({ eventNumber: 0, gameId: 2023030417 }),
		).toThrow(/eventNumber must be a positive integer/);
	});
});
