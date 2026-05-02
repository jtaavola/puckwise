import { describe, expect, it, vi } from "vitest";
import { createNhlApiClient } from "../src/index.js";
import {
	playerGameLogFixture,
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

describe("players domain client", () => {
	describe("Web API URL construction", () => {
		it("builds the player landing URL", async () => {
			const { fetch, requests } = recordingFetch(playerLandingSkaterFixture);
			const client = createNhlApiClient({ fetch });

			await client.players.getLanding(8478402);

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/player/8478402/landing",
			);
		});

		it("builds the player game log URL", async () => {
			const { fetch, requests } = recordingFetch(playerGameLogFixture);
			const client = createNhlApiClient({ fetch });

			await client.players.getGameLog(8478402, {
				gameType: 2,
				season: 20232024,
			});

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/player/8478402/game-log/20232024/2",
			);
		});

		it("builds the player spotlight URL", async () => {
			const { fetch, requests } = recordingFetch(playerSpotlightFixture);
			const client = createNhlApiClient({ fetch });

			await client.players.getSpotlight();

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/player-spotlight",
			);
		});
	});

	describe("Stats API URL construction", () => {
		it("builds the player search URL with cayenne filters", async () => {
			const { fetch, requests } = recordingFetch(statsPlayerInfoFixture);
			const client = createNhlApiClient({ fetch });

			await client.players.search({
				active: true,
				currentTeamId: 22,
				limit: 10,
				positionCode: "C",
				sort: "lastName",
			});

			expect(requests[0]?.pathname).toBe("/stats/rest/en/players");
			expect(requests[0]?.searchParams.get("cayenneExp")).toBe(
				'active=true and currentTeamId=22 and positionCode="C"',
			);
			expect(requests[0]?.searchParams.get("limit")).toBe("10");
			expect(requests[0]?.searchParams.get("sort")).toBe("lastName");
		});

		it("builds the player info URL with cayenne filters", async () => {
			const { fetch, requests } = recordingFetch(statsPlayerInfoFixture);
			const client = createNhlApiClient({ fetch });

			await client.players.getInfo(8478402);

			expect(requests[0]?.pathname).toBe("/stats/rest/en/players");
			expect(requests[0]?.searchParams.get("cayenneExp")).toBe("id=8478402");
		});

		it("builds the skater stats URL with cayenne filters", async () => {
			const { fetch, requests } = recordingFetch(statsSkaterStatsFixture);
			const client = createNhlApiClient({ fetch });

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

			expect(requests[0]?.pathname).toBe("/stats/rest/en/skater/summary");
			expect(requests[0]?.searchParams.get("cayenneExp")).toBe(
				'gameTypeId=2 and positionCode="C" and seasonId=20232024 and teamId=22',
			);
			expect(requests[0]?.searchParams.get("dir")).toBe("desc");
			expect(requests[0]?.searchParams.get("limit")).toBe("5");
			expect(requests[0]?.searchParams.get("sort")).toBe("points");
		});

		it("builds the goalie stats URL with cayenne filters", async () => {
			const { fetch, requests } = recordingFetch(statsGoalieStatsFixture);
			const client = createNhlApiClient({ fetch });

			await client.players.getGoalieStats({
				gameType: 2,
				playerId: 8476999,
				report: "summary",
				season: 20232024,
				sort: "wins",
			});

			expect(requests[0]?.pathname).toBe("/stats/rest/en/goalie/summary");
			expect(requests[0]?.searchParams.get("cayenneExp")).toBe(
				"gameTypeId=2 and playerId=8476999 and seasonId=20232024",
			);
			expect(requests[0]?.searchParams.get("sort")).toBe("wins");
		});

		it("builds the skater leaders URL", async () => {
			const { fetch, requests } = recordingFetch(statsLeaderFixture);
			const client = createNhlApiClient({ fetch });

			await client.players.getSkaterLeaders({ attribute: "points", limit: 5 });

			expect(requests[0]?.toString()).toBe(
				"https://api.nhle.com/stats/rest/en/leaders/skaters/points?limit=5",
			);
		});

		it("builds the goalie leaders URL", async () => {
			const { fetch, requests } = recordingFetch(statsLeaderFixture);
			const client = createNhlApiClient({ fetch });

			await client.players.getGoalieLeaders({ attribute: "wins", limit: 3 });

			expect(requests[0]?.toString()).toBe(
				"https://api.nhle.com/stats/rest/en/leaders/goalies/wins?limit=3",
			);
		});

		it("builds the milestones URL", async () => {
			const { fetch, requests } = recordingFetch(statsMilestoneFixture);
			const client = createNhlApiClient({ fetch });

			await client.players.getMilestones({ kind: "skaters", limit: 5 });

			expect(requests[0]?.toString()).toBe(
				"https://api.nhle.com/stats/rest/en/milestones/skaters?limit=5",
			);
		});
	});

	describe("pre-fetch validation", () => {
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
});
