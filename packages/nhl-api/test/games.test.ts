import { describe, expect, it, vi } from "vitest";
import { createNhlApiClient } from "../src/index.js";
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

function recordingFetch(data: unknown): {
	fetch: ReturnType<typeof vi.fn>;
	requests: URL[];
} {
	const requests: URL[] = [];
	const fetch = vi.fn(async (input: RequestInfo | URL) => {
		const url = new URL(input.toString());
		requests.push(url);

		return jsonResponse(data);
	});

	return { fetch, requests };
}

describe("games domain client", () => {
	describe("scores URL construction", () => {
		it("builds the dated scores URL", async () => {
			const { fetch, requests } = recordingFetch(scoresFixture);
			const client = createNhlApiClient({ fetch });

			await client.games.getScores({ date: "2024-06-24" });

			expect(requests[0]?.toString()).toBe("https://api-web.nhle.com/v1/score/2024-06-24");
		});

		it("builds the current scores URL", async () => {
			const { fetch, requests } = recordingFetch(scoresFixture);
			const client = createNhlApiClient({ fetch });

			await client.games.getScores();

			expect(requests[0]?.toString()).toBe("https://api-web.nhle.com/v1/score/now");
		});

		it("builds the team scoreboard URL", async () => {
			const { fetch, requests } = recordingFetch(scoreboardFixture);
			const client = createNhlApiClient({ fetch });

			await client.games.getScoreboard({ team: "min" });

			expect(requests[0]?.toString()).toBe("https://api-web.nhle.com/v1/scoreboard/MIN/now");
		});
	});

	describe("gamecenter URL construction", () => {
		it("builds the game landing URL", async () => {
			const { fetch, requests } = recordingFetch(landingFixture);
			const client = createNhlApiClient({ fetch });

			await client.games.getLanding(2023030417);

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/gamecenter/2023030417/landing",
			);
		});

		it("builds the game boxscore URL", async () => {
			const { fetch, requests } = recordingFetch(boxscoreFixture);
			const client = createNhlApiClient({ fetch });

			await client.games.getBoxscore(2023030417);

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/gamecenter/2023030417/boxscore",
			);
		});

		it("builds the game play-by-play URL", async () => {
			const { fetch, requests } = recordingFetch(playByPlayFixture);
			const client = createNhlApiClient({ fetch });

			await client.games.getPlayByPlay(2023030417);

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/gamecenter/2023030417/play-by-play",
			);
		});
	});

	describe("WSC URL construction", () => {
		it("builds the WSC game story URL", async () => {
			const { fetch, requests } = recordingFetch(storyFixture);
			const client = createNhlApiClient({ fetch });

			await client.games.getStory(2023030417);

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/wsc/game-story/2023030417",
			);
		});

		it("builds the WSC play-by-play URL", async () => {
			const { fetch, requests } = recordingFetch(wscPlayByPlayFixture);
			const client = createNhlApiClient({ fetch });

			await client.games.getWscPlayByPlay({ gameId: 2023030417 });

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/wsc/play-by-play/2023030417",
			);
		});
	});

	describe("stats URL construction", () => {
		it("builds the game info URL with cayenne filters", async () => {
			const { fetch, requests } = recordingFetch(statsGameInfoFixture);
			const client = createNhlApiClient({ fetch });

			await client.games.getInfo({
				gameId: 2023030417,
				gameType: 3,
				season: 20232024,
				sort: "gameDate",
			});

			expect(requests[0]?.pathname).toBe("/stats/rest/en/game");
			expect(requests[0]?.searchParams.get("cayenneExp")).toBe(
				"id=2023030417 and gameType=3 and season=20232024",
			);
			expect(requests[0]?.searchParams.get("sort")).toBe("gameDate");
		});

		it("builds the game metadata URL", async () => {
			const { fetch, requests } = recordingFetch(statsGameMetadataFixture);
			const client = createNhlApiClient({ fetch });

			await client.games.getMetadata();

			expect(requests[0]?.pathname).toBe("/stats/rest/en/game/meta");
		});

		it("builds the shift charts URL with cayenne filters", async () => {
			const { fetch, requests } = recordingFetch(shiftChartsFixture);
			const client = createNhlApiClient({ fetch });

			await client.games.getShiftCharts({
				gameId: 2023030417,
				playerId: 8478402,
				teamAbbrev: "EDM",
			});

			expect(requests[0]?.pathname).toBe("/stats/rest/en/shiftcharts");
			expect(requests[0]?.searchParams.get("cayenneExp")).toBe(
				'gameId=2023030417 and playerId=8478402 and teamAbbrev="EDM"',
			);
		});
	});

	describe("broadcast URL construction", () => {
		it("builds the game streams URL", async () => {
			const { fetch, requests } = recordingFetch(streamsFixture);
			const client = createNhlApiClient({ fetch });

			await client.games.getStreams({ include: "providers" });

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/where-to-watch?include=providers",
			);
		});

		it("builds the TV schedule URL for a date", async () => {
			const { fetch, requests } = recordingFetch(tvScheduleFixture);
			const client = createNhlApiClient({ fetch });

			await client.games.getTvSchedule({ date: new Date("2024-06-24T12:00:00.000Z") });

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/network/tv-schedule/2024-06-24",
			);
		});
	});

	describe("partner URL construction", () => {
		it("builds the game odds URL", async () => {
			const { fetch, requests } = recordingFetch(oddsFixture);
			const client = createNhlApiClient({ fetch });

			await client.games.getOdds({ countryCode: "us" });

			expect(requests[0]?.toString()).toBe("https://api-web.nhle.com/v1/partner-game/US/now");
		});
	});

	describe("replay URL construction", () => {
		it("builds the typed replay URL", async () => {
			const { fetch, requests } = recordingFetch(replayFixture);
			const client = createNhlApiClient({ fetch });

			await client.games.getReplays({
				eventNumber: 12,
				gameId: 2023030417,
				kind: "goal",
			});

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/ppt-replay/goal/2023030417/12",
			);
		});

		it("builds the replay URL without a type", async () => {
			const { fetch, requests } = recordingFetch(replayFixture);
			const client = createNhlApiClient({ fetch });

			await client.games.getReplays({
				eventNumber: 13,
				gameId: 2023030417,
			});

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/ppt-replay/2023030417/13",
			);
		});
	});

	describe("pre-fetch validation", () => {
		it("rejects invalid score dates before fetch", () => {
			const client = createNhlApiClient({
				fetch: vi.fn(async () => jsonResponse(scoresFixture)),
			});

			expect(() => client.games.getScores({ date: "2024/06/24" })).toThrow(
				/Invalid game date/,
			);
		});

		it("rejects invalid odds country codes before fetch", () => {
			const client = createNhlApiClient({
				fetch: vi.fn(async () => jsonResponse(scoresFixture)),
			});

			expect(() => client.games.getOdds({ countryCode: "usa" })).toThrow(
				/Invalid country code/,
			);
		});

		it("rejects invalid replay event numbers before fetch", () => {
			const client = createNhlApiClient({
				fetch: vi.fn(async () => jsonResponse(scoresFixture)),
			});

			expect(() =>
				client.games.getReplays({ eventNumber: 0, gameId: 2023030417 }),
			).toThrow(/eventNumber must be a positive integer/);
		});
	});
});
