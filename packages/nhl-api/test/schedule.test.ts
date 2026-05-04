import { describe, expect, it, vi } from "vitest";
import { createNhlApiClient } from "../src/index.js";
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

describe("schedule and season clients", () => {
	describe("schedule URL construction", () => {
		it("builds the current league schedule URL", async () => {
			const { fetch, requests } = recordingFetch(leagueScheduleFixture);
			const client = createNhlApiClient({ fetch });

			await client.schedule.getLeagueSchedule({ lang: "fr" });

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/schedule/now?lang=fr",
			);
		});

		it("accepts placeholder teams in the current league schedule", async () => {
			const fixture = structuredClone(leagueScheduleFixture);
			fixture.gameWeek[0].games[0].awayTeam.id = -1;
			const { fetch } = recordingFetch(fixture);
			const client = createNhlApiClient({ fetch });

			const schedule = await client.schedule.getLeagueSchedule();

			expect(schedule.gameWeek[0]?.games[0]?.awayTeam?.id).toBe(-1);
		});

		it("builds the dated league schedule URL", async () => {
			const { fetch, requests } = recordingFetch(historicalScheduleFixture);
			const client = createNhlApiClient({ fetch });

			await client.schedule.getByDate("2024-01-13");

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/schedule/2024-01-13",
			);
		});

		it("builds the current schedule calendar URL", async () => {
			const { fetch, requests } = recordingFetch(scheduleCalendarFixture);
			const client = createNhlApiClient({ fetch });

			await client.schedule.getCalendar();

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/schedule-calendar/now",
			);
		});

		it("builds the dated schedule calendar URL", async () => {
			const { fetch, requests } = recordingFetch(scheduleCalendarFixture);
			const client = createNhlApiClient({ fetch });

			await client.schedule.getCalendar({ date: "2024-10-04", lang: "en" });

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/schedule-calendar/2024-10-04?lang=en",
			);
		});
	});

	describe("season URL construction", () => {
		it("builds the Web API seasons URL", async () => {
			const { fetch, requests } = recordingFetch(webSeasonsFixture);
			const client = createNhlApiClient({ fetch });

			await client.seasons.getWebSeasons();

			expect(requests[0]?.toString()).toBe(
				"https://api-web.nhle.com/v1/season",
			);
		});

		it("builds the component seasons URL with cayenne filters", async () => {
			const { fetch, requests } = recordingFetch(statsComponentSeasonsFixture);
			const client = createNhlApiClient({ fetch });

			await client.seasons.getComponentSeasons({
				component: "StatsHome",
				gameType: 2,
				season: 20242025,
			});

			expect(requests[0]?.pathname).toBe("/stats/rest/en/componentSeason");
			expect(requests[0]?.searchParams.get("cayenneExp")).toBe(
				'component="StatsHome" and gameTypeId=2 and seasonId=20242025',
			);
		});

		it("builds the Stats API seasons URL with cayenne filters", async () => {
			const { fetch, requests } = recordingFetch(statsSeasonsFixture);
			const client = createNhlApiClient({ fetch });

			await client.seasons.getStatsSeasons({
				limit: 1,
				rowInUse: 1,
				season: 20242025,
			});

			expect(requests[0]?.pathname).toBe("/stats/rest/en/season");
			expect(requests[0]?.searchParams.get("cayenneExp")).toBe(
				"id=20242025 and rowInUse=1",
			);
			expect(requests[0]?.searchParams.get("limit")).toBe("1");
		});
	});

	describe("pre-fetch validation", () => {
		it("rejects invalid schedule dates before fetch", () => {
			const fetch = vi.fn(async () => jsonResponse(leagueScheduleFixture));
			const client = createNhlApiClient({ fetch });

			expect(() => client.schedule.getByDate("2024/10/04")).toThrow(
				/ISO date string/,
			);
			expect(fetch).not.toHaveBeenCalled();
		});

		it("rejects invalid schedule calendar dates before fetch", () => {
			const fetch = vi.fn(async () => jsonResponse(leagueScheduleFixture));
			const client = createNhlApiClient({ fetch });

			expect(() => client.schedule.getCalendar({ date: "" })).toThrow(
				/ISO date string/,
			);
			expect(fetch).not.toHaveBeenCalled();
		});

		it("rejects invalid component season IDs before fetch", () => {
			const fetch = vi.fn(async () => jsonResponse(leagueScheduleFixture));
			const client = createNhlApiClient({ fetch });

			expect(() =>
				client.seasons.getComponentSeasons({ season: 20242026 }),
			).toThrow(/consecutive years/);
			expect(fetch).not.toHaveBeenCalled();
		});
	});
});
