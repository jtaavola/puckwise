import { describe, expect, it, vi } from "vitest";
import { createNhlApiClient } from "../src/index.js";
import {
	clubStatsFixture,
	prospectsFixture,
	rosterFixture,
	statsFranchiseFixture,
	statsTeamInfoFixture,
	statsTeamStatsFixture,
	teamScheduleFixture,
	teamScoreboardFixture,
	standingsFixture,
} from "./fixtures/teams.js";

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

describe("teams domain client", () => {
	describe("standings URL construction", () => {
		it("builds the dated standings URL", async () => {
			const { fetch, requests } = recordingFetch(standingsFixture);
			const client = createNhlApiClient({ fetch });

			await client.teams.getStandings({ date: "2024-04-18" });

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/standings/2024-04-18",
			);
		});

		it("builds the current standings URL", async () => {
			const { fetch, requests } = recordingFetch(standingsFixture);
			const client = createNhlApiClient({ fetch });

			await client.teams.getStandings();

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/standings/now",
			);
		});
	});

	describe("club URL construction", () => {
		it("builds the season club stats URL", async () => {
			const { fetch, requests } = recordingFetch(clubStatsFixture);
			const client = createNhlApiClient({ fetch });

			await client.teams.getClubStats("edm", {
				gameType: 2,
				season: 20232024,
			});

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/club-stats/EDM/20232024/2",
			);
		});

		it("builds the current club stats URL", async () => {
			const { fetch, requests } = recordingFetch(clubStatsFixture);
			const client = createNhlApiClient({ fetch });

			await client.teams.getClubStats("EDM");

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/club-stats/EDM/now",
			);
		});

		it("builds the season roster URL", async () => {
			const { fetch, requests } = recordingFetch(rosterFixture);
			const client = createNhlApiClient({ fetch });

			await client.teams.getRoster("EDM", { season: 20232024 });

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/roster/EDM/20232024",
			);
		});

		it("builds the current roster URL", async () => {
			const { fetch, requests } = recordingFetch(rosterFixture);
			const client = createNhlApiClient({ fetch });

			await client.teams.getRoster("EDM");

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/roster/EDM/current",
			);
		});

		it("builds the prospects URL", async () => {
			const { fetch, requests } = recordingFetch(prospectsFixture);
			const client = createNhlApiClient({ fetch });

			await client.teams.getProspects("EDM");

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/prospects/EDM",
			);
		});

		it("builds the scoreboard URL", async () => {
			const { fetch, requests } = recordingFetch(teamScoreboardFixture);
			const client = createNhlApiClient({ fetch });

			await client.teams.getScoreboard("EDM");

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/scoreboard/EDM/now",
			);
		});
	});

	describe("schedule URL construction", () => {
		it("builds the season schedule URL", async () => {
			const { fetch, requests } = recordingFetch(teamScheduleFixture);
			const client = createNhlApiClient({ fetch });

			await client.teams.getSchedule("EDM", { season: 20232024 });

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/club-schedule-season/EDM/20232024",
			);
		});

		it("builds the current season schedule URL", async () => {
			const { fetch, requests } = recordingFetch(teamScheduleFixture);
			const client = createNhlApiClient({ fetch });

			await client.teams.getSchedule("EDM");

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/club-schedule-season/EDM/now",
			);
		});

		it("builds the monthly schedule URL", async () => {
			const { fetch, requests } = recordingFetch(teamScheduleFixture);
			const client = createNhlApiClient({ fetch });

			await client.teams.getSchedule("EDM", { month: "2023-11" });

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/club-schedule/EDM/month/2023-11",
			);
		});

		it("builds the weekly schedule URL", async () => {
			const { fetch, requests } = recordingFetch(teamScheduleFixture);
			const client = createNhlApiClient({ fetch });

			await client.teams.getSchedule("EDM", { weekDate: "2023-11-10" });

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/club-schedule/EDM/week/2023-11-10",
			);
		});
	});

	describe("stats URL construction", () => {
		it("builds the team info URL with cayenne filters", async () => {
			const { fetch, requests } = recordingFetch(statsTeamInfoFixture);
			const client = createNhlApiClient({ fetch });

			await client.teams.getInfo({ franchiseId: 25, limit: 5, teamId: 22 });

			expect(requests[0]?.pathname).toBe("/stats/rest/en/team");
			expect(requests[0]?.searchParams.get("cayenneExp")).toBe(
				"franchiseId=25 and id=22",
			);
			expect(requests[0]?.searchParams.get("limit")).toBe("5");
		});

		it("builds the team by ID URL", async () => {
			const { fetch, requests } = recordingFetch(statsTeamInfoFixture);
			const client = createNhlApiClient({ fetch });

			await client.teams.getById(22);

			expect(requests[0]?.pathname).toBe("/stats/rest/en/team/id/22");
		});

		it("builds the team stats URL with cayenne filters", async () => {
			const { fetch, requests } = recordingFetch(statsTeamStatsFixture);
			const client = createNhlApiClient({ fetch });

			await client.teams.getStats({
				gameType: 2,
				limit: 10,
				season: 20232024,
				sort: "points",
				teamId: 22,
			});

			expect(requests[0]?.pathname).toBe("/stats/rest/en/team/summary");
			expect(requests[0]?.searchParams.get("cayenneExp")).toBe(
				"gameTypeId=2 and seasonId=20232024 and teamId=22",
			);
			expect(requests[0]?.searchParams.get("limit")).toBe("10");
			expect(requests[0]?.searchParams.get("sort")).toBe("points");
		});

		it("builds the franchise URL with cayenne filters", async () => {
			const { fetch, requests } = recordingFetch(statsFranchiseFixture);
			const client = createNhlApiClient({ fetch });

			await client.teams.getFranchises({ franchiseId: 25 });

			expect(requests[0]?.pathname).toBe("/stats/rest/en/franchise");
			expect(requests[0]?.searchParams.get("cayenneExp")).toBe("id=25");
		});
	});

	describe("pre-fetch validation", () => {
		it("rejects invalid standings dates before fetch", () => {
			const client = createNhlApiClient({
				fetch: vi.fn(async () => jsonResponse(standingsFixture)),
			});

			expect(() => client.teams.getStandings({ date: "20240418" })).toThrow(
				/Expected YYYY-MM-DD/,
			);
		});

		it("rejects invalid Stats API languages before fetch", () => {
			const client = createNhlApiClient({
				fetch: vi.fn(async () => jsonResponse(statsTeamInfoFixture)),
			});

			expect(() => client.teams.getById(22, { lang: "../fr" })).toThrow(
				/Invalid Stats API language/,
			);
		});

		it("rejects invalid club stats team abbreviations before fetch", () => {
			const fetch = vi.fn(async () => jsonResponse(clubStatsFixture));
			const client = createNhlApiClient({ fetch });

			expect(() => client.teams.getClubStats("..")).toThrow(
				/Expected an alphabetic team code/,
			);
			expect(fetch).not.toHaveBeenCalled();
		});

		it("rejects invalid roster team abbreviations before fetch", () => {
			const fetch = vi.fn(async () => jsonResponse(rosterFixture));
			const client = createNhlApiClient({ fetch });

			expect(() => client.teams.getRoster("..")).toThrow(
				/Expected an alphabetic team code/,
			);
			expect(fetch).not.toHaveBeenCalled();
		});

		it("rejects invalid prospects team abbreviations before fetch", () => {
			const fetch = vi.fn(async () => jsonResponse(prospectsFixture));
			const client = createNhlApiClient({ fetch });

			expect(() => client.teams.getProspects("..")).toThrow(
				/Expected an alphabetic team code/,
			);
			expect(fetch).not.toHaveBeenCalled();
		});

		it("rejects invalid schedule team abbreviations before fetch", () => {
			const fetch = vi.fn(async () => jsonResponse(teamScheduleFixture));
			const client = createNhlApiClient({ fetch });

			expect(() => client.teams.getSchedule("..")).toThrow(
				/Expected an alphabetic team code/,
			);
			expect(fetch).not.toHaveBeenCalled();
		});

		it("rejects invalid scoreboard team abbreviations before fetch", () => {
			const fetch = vi.fn(async () => jsonResponse(teamScoreboardFixture));
			const client = createNhlApiClient({ fetch });

			expect(() => client.teams.getScoreboard("..")).toThrow(
				/Expected an alphabetic team code/,
			);
			expect(fetch).not.toHaveBeenCalled();
		});
	});
});
