import { describe, expect, it, vi } from "vitest";
import {
	createNhlApiClient,
	leagueScheduleSchema,
	scheduleCalendarSchema,
	scheduleGameSummarySchema,
	statsComponentSeasonsResponseSchema,
	statsSeasonsResponseSchema,
	webSeasonsSchema,
} from "../src/index.js";
import {
	historicalScheduleFixture,
	leagueScheduleFixture,
	scheduleCalendarFixture,
	statsComponentSeasonsFixture,
	statsSeasonsFixture,
	webSeasonsFixture,
} from "./fixtures/schedule.js";

function jsonResponse(data: unknown): Response {
	return new Response(JSON.stringify(data), {
		headers: { "content-type": "application/json" },
		status: 200,
	});
}

describe("schedule and season schemas", () => {
	it("parses current and historical league schedule fixtures", () => {
		expect(leagueScheduleSchema.parse(leagueScheduleFixture).gameWeek[0]).toMatchObject({
			date: "2024-10-04",
			numberOfGames: 1,
		});
		expect(leagueScheduleSchema.parse(historicalScheduleFixture).gameWeek[0]?.games[0]).toMatchObject({
			id: 2023020657,
			season: 20232024,
		});
	});

	it("parses schedule calendar, Web API seasons, and Stats API seasons", () => {
		expect(scheduleCalendarSchema.parse(scheduleCalendarFixture).teams[0]).toMatchObject({
			abbrev: "NJD",
			seasonId: 20242025,
		});
		expect(webSeasonsSchema.parse(webSeasonsFixture)).toContain(20232024);
		expect(statsComponentSeasonsResponseSchema.parse(statsComponentSeasonsFixture).data[0]).toMatchObject({
			component: "StatsHome",
			seasonId: 20252026,
		});
		expect(statsSeasonsResponseSchema.parse(statsSeasonsFixture).data).toHaveLength(2);
	});

	it("keeps schedule game summaries reusable as standalone parsed values", () => {
		const game = leagueScheduleFixture.gameWeek[0]?.games[0];

		expect(scheduleGameSummarySchema.parse(game)).toMatchObject({
			id: 2024020001,
			awayTeam: { abbrev: "NJD" },
			homeTeam: { abbrev: "BUF" },
		});
	});

	it("rejects invalid ISO calendar dates in schedule groupings", () => {
		expect(() =>
			leagueScheduleSchema.parse({
				gameWeek: [{ date: "2024/10/04", games: [] }],
			}),
		).toThrow();
	});
});

describe("schedule and season clients", () => {
	it("uses Web API endpoints for league schedules and calendars", async () => {
		const requests: string[] = [];
		const fetch = vi.fn(async (input: RequestInfo | URL) => {
			requests.push(input.toString());
			const pathname = new URL(input.toString()).pathname;

			if (pathname.includes("/schedule-calendar/")) {
				return jsonResponse(scheduleCalendarFixture);
			}

			if (pathname.endsWith("/season")) {
				return jsonResponse(webSeasonsFixture);
			}

			if (pathname.endsWith("/schedule/2024-01-13")) {
				return jsonResponse(historicalScheduleFixture);
			}

			return jsonResponse(leagueScheduleFixture);
		});
		const client = createNhlApiClient({ fetch });

		await client.schedule.getLeagueSchedule({ lang: "fr" });
		await client.schedule.getByDate("2024-01-13");
		await client.schedule.getCalendar();
		await client.schedule.getCalendar({ date: "2024-10-04", lang: "en" });
		await client.seasons.getWebSeasons();

		expect(requests).toEqual([
			"https://api-web.nhle.com/v1/schedule/now?lang=fr",
			"https://api-web.nhle.com/v1/schedule/2024-01-13",
			"https://api-web.nhle.com/v1/schedule-calendar/now",
			"https://api-web.nhle.com/v1/schedule-calendar/2024-10-04?lang=en",
			"https://api-web.nhle.com/v1/season",
		]);
	});

	it("serializes Stats API season filters with deterministic cayenne expressions", async () => {
		const requests: URL[] = [];
		const fetch = vi.fn(async (input: RequestInfo | URL) => {
			const url = new URL(input.toString());
			requests.push(url);

			if (url.pathname.includes("/componentSeason")) {
				return jsonResponse(statsComponentSeasonsFixture);
			}

			return jsonResponse(statsSeasonsFixture);
		});
		const client = createNhlApiClient({ fetch });

		await client.seasons.getComponentSeasons({
			component: "StatsHome",
			gameType: 2,
			season: 20242025,
		});
		await client.seasons.getStatsSeasons({
			limit: 1,
			rowInUse: 1,
			season: 20242025,
		});

		expect(requests.map((url) => url.pathname)).toEqual([
			"/stats/rest/en/componentSeason",
			"/stats/rest/en/season",
		]);
		expect(requests[0]?.searchParams.get("cayenneExp")).toBe(
			'component="StatsHome" and gameTypeId=2 and seasonId=20242025',
		);
		expect(requests[1]?.searchParams.get("cayenneExp")).toBe(
			"id=20242025 and rowInUse=1",
		);
		expect(requests[1]?.searchParams.get("limit")).toBe("1");
	});

	it("validates SDK date and season inputs before request construction", async () => {
		const client = createNhlApiClient({
			fetch: vi.fn(async () => jsonResponse(leagueScheduleFixture)),
		});

		expect(() => client.schedule.getByDate("2024/10/04")).toThrow(
			/ISO date string/,
		);
		expect(() =>
			client.seasons.getComponentSeasons({ season: 20242026 }),
		).toThrow(/consecutive years/);
	});
});
