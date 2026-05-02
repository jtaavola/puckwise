import { describe, expect, it, vi } from "vitest";
import {
	clubStatsSchema,
	createNhlApiClient,
	prospectsSchema,
	rosterSchema,
	standingsSchema,
	statsFranchiseResponseSchema,
	statsTeamInfoResponseSchema,
	statsTeamStatsResponseSchema,
	teamScheduleSchema,
	teamScoreboardSchema,
} from "../src/index.js";
import {
	clubStatsFixture,
	prospectsFixture,
	rosterFixture,
	standingsFixture,
	statsFranchiseFixture,
	statsTeamInfoFixture,
	statsTeamStatsFixture,
	teamScheduleFixture,
	teamScoreboardFixture,
} from "./fixtures/teams.js";

function jsonResponse(data: unknown): Response {
	return new Response(JSON.stringify(data), {
		headers: { "content-type": "application/json" },
		status: 200,
	});
}

describe("teams domain schemas", () => {
	it("parses Web API team fixtures", () => {
		expect(standingsSchema.parse(standingsFixture).standings[0]).toMatchObject({
			points: 104,
			teamAbbrev: "EDM",
		});
		expect(clubStatsSchema.parse(clubStatsFixture).skaters?.[0]).toMatchObject({
			playerId: 8478402,
			points: 132,
		});
		expect(rosterSchema.parse(rosterFixture).forwards?.[0]).toMatchObject({
			id: 8478402,
		});
		expect(prospectsSchema.parse(prospectsFixture).prospects?.[0]).toMatchObject({
			draftOverall: 56,
		});
		expect(teamScheduleSchema.parse(teamScheduleFixture).games[0]).toMatchObject({
			id: 2023020007,
		});
		expect(teamScoreboardSchema.parse(teamScoreboardFixture).games?.[0]).toMatchObject({
			id: 2023021304,
		});
	});

	it("parses Stats API team and franchise fixtures", () => {
		expect(statsTeamInfoResponseSchema.parse(statsTeamInfoFixture).data[0]).toMatchObject({
			fullName: "Edmonton Oilers",
			id: 22,
		});
		expect(statsTeamStatsResponseSchema.parse(statsTeamStatsFixture).data[0]).toMatchObject({
			points: 104,
			teamId: 22,
		});
		expect(statsFranchiseResponseSchema.parse(statsFranchiseFixture).data[0]).toMatchObject({
			franchiseId: 25,
		});
	});
});

describe("teams domain client", () => {
	it("uses Web API endpoints for standings, stats, roster, prospects, schedule, and scoreboard", async () => {
		const requests: string[] = [];
		const fetch = vi.fn(async (input: RequestInfo | URL) => {
			const url = new URL(input.toString());
			requests.push(url.toString());

			if (url.pathname.includes("/club-stats/")) {
				return jsonResponse(clubStatsFixture);
			}

			if (url.pathname.includes("/roster/")) {
				return jsonResponse(rosterFixture);
			}

			if (url.pathname.includes("/prospects/")) {
				return jsonResponse(prospectsFixture);
			}

			if (url.pathname.includes("/club-schedule")) {
				return jsonResponse(teamScheduleFixture);
			}

			if (url.pathname.includes("/scoreboard/")) {
				return jsonResponse(teamScoreboardFixture);
			}

			return jsonResponse(standingsFixture);
		});
		const client = createNhlApiClient({ fetch });

		await client.teams.getStandings({ date: "2024-04-18" });
		await client.teams.getClubStats("edm", {
			gameType: 2,
			season: 20232024,
		});
		await client.teams.getRoster("EDM", { season: 20232024 });
		await client.teams.getProspects("EDM");
		await client.teams.getSchedule("EDM", { season: 20232024 });
		await client.teams.getSchedule("EDM", { month: "2023-11" });
		await client.teams.getSchedule("EDM", { weekDate: "2023-11-10" });
		await client.teams.getScoreboard("EDM");

		expect(requests).toEqual([
			"https://api-web.nhle.com/v1/standings/2024-04-18",
			"https://api-web.nhle.com/v1/club-stats/EDM/20232024/2",
			"https://api-web.nhle.com/v1/roster/EDM/20232024",
			"https://api-web.nhle.com/v1/prospects/EDM",
			"https://api-web.nhle.com/v1/club-schedule-season/EDM/20232024",
			"https://api-web.nhle.com/v1/club-schedule/EDM/month/2023-11",
			"https://api-web.nhle.com/v1/club-schedule/EDM/week/2023-11-10",
			"https://api-web.nhle.com/v1/scoreboard/EDM/now",
		]);
	});

	it("uses now/current Web API endpoints when optional selectors are omitted", async () => {
		const requests: string[] = [];
		const fetch = vi.fn(async (input: RequestInfo | URL) => {
			const url = new URL(input.toString());
			requests.push(url.toString());

			if (url.pathname.includes("/club-stats/")) {
				return jsonResponse(clubStatsFixture);
			}

			if (url.pathname.includes("/roster/")) {
				return jsonResponse(rosterFixture);
			}

			if (url.pathname.includes("/club-schedule")) {
				return jsonResponse(teamScheduleFixture);
			}

			return jsonResponse(standingsFixture);
		});
		const client = createNhlApiClient({ fetch });

		await client.teams.getStandings();
		await client.teams.getClubStats("EDM");
		await client.teams.getRoster("EDM");
		await client.teams.getSchedule("EDM");

		expect(requests).toEqual([
			"https://api-web.nhle.com/v1/standings/now",
			"https://api-web.nhle.com/v1/club-stats/EDM/now",
			"https://api-web.nhle.com/v1/roster/EDM/current",
			"https://api-web.nhle.com/v1/club-schedule-season/EDM/now",
		]);
	});

	it("uses Stats API endpoints and deterministic cayenne filters", async () => {
		const requests: URL[] = [];
		const fetch = vi.fn(async (input: RequestInfo | URL) => {
			const url = new URL(input.toString());
			requests.push(url);

			if (url.pathname.includes("/franchise")) {
				return jsonResponse(statsFranchiseFixture);
			}

			if (url.pathname.includes("/team/summary")) {
				return jsonResponse(statsTeamStatsFixture);
			}

			return jsonResponse(statsTeamInfoFixture);
		});
		const client = createNhlApiClient({ fetch });

		await client.teams.getInfo({ franchiseId: 25, limit: 5, teamId: 22 });
		await client.teams.getById(22);
		await client.teams.getStats({
			gameType: 2,
			limit: 10,
			season: 20232024,
			sort: "points",
			teamId: 22,
		});
		await client.teams.getFranchises({ franchiseId: 25 });

		expect(requests.map((url) => url.pathname)).toEqual([
			"/stats/rest/en/team",
			"/stats/rest/en/team/id/22",
			"/stats/rest/en/team/summary",
			"/stats/rest/en/franchise",
		]);
		expect(requests[0]?.searchParams.get("cayenneExp")).toBe(
			"franchiseId=25 and id=22",
		);
		expect(requests[0]?.searchParams.get("limit")).toBe("5");
		expect(requests[2]?.searchParams.get("cayenneExp")).toBe(
			"gameTypeId=2 and seasonId=20232024 and teamId=22",
		);
		expect(requests[2]?.searchParams.get("limit")).toBe("10");
		expect(requests[2]?.searchParams.get("sort")).toBe("points");
		expect(requests[3]?.searchParams.get("cayenneExp")).toBe("id=25");
	});

	it("rejects invalid dates and Stats API languages", () => {
		const client = createNhlApiClient({
			fetch: vi.fn(async () => jsonResponse(statsTeamInfoFixture)),
		});

		expect(() => client.teams.getStandings({ date: "20240418" })).toThrow(
			/Expected YYYY-MM-DD/,
		);
		expect(() => client.teams.getById(22, { lang: "../fr" })).toThrow(
			/Invalid Stats API language/,
		);
	});

	it("rejects non-alphabetic team abbreviations before building path params", () => {
		const fetch = vi.fn(async () => jsonResponse(clubStatsFixture));
		const client = createNhlApiClient({ fetch });

		expect(() => client.teams.getClubStats("..")).toThrow(
			/Expected an alphabetic team code/,
		);
		expect(() => client.teams.getRoster("..")).toThrow(
			/Expected an alphabetic team code/,
		);
		expect(() => client.teams.getProspects("..")).toThrow(
			/Expected an alphabetic team code/,
		);
		expect(() => client.teams.getSchedule("..")).toThrow(
			/Expected an alphabetic team code/,
		);
		expect(() => client.teams.getScoreboard("..")).toThrow(
			/Expected an alphabetic team code/,
		);
		expect(fetch).not.toHaveBeenCalled();
	});
});
