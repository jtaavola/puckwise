import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
	NhlApiError,
	buildUrl,
	cayenneAnd,
	cayenneEq,
	createNhlApiClient,
	interpolatePath,
	parseNhlApiResponse,
	serializeQuery,
} from "../src/index.js";

const okSchema = z.object({
	ok: z.boolean(),
});

function jsonResponse(data: unknown, init: ResponseInit = {}): Response {
	return new Response(JSON.stringify(data), {
		headers: { "content-type": "application/json" },
		status: 200,
		...init,
	});
}

describe("NHL API client foundation", () => {
	it("selects base URLs for Web API, Stats API, and NHL Edge requests", async () => {
		const requests: string[] = [];
		const fetch = vi.fn(async (input: RequestInfo | URL) => {
			requests.push(input.toString());
			return jsonResponse({ ok: true });
		});
		const client = createNhlApiClient({ fetch });

		await client.web("/club-stats/{team}", {
			pathParams: { team: "MIN" },
			schema: okSchema,
		});
		await client.stats("/players", { schema: okSchema });
		await client.edge("/skater", { schema: okSchema });

		expect(requests).toEqual([
			"https://api-web.nhle.com/v1/club-stats/MIN",
			"https://api.nhle.com/stats/rest/en/players",
			"https://api-web.nhle.com/v1/edge/skater",
		]);
	});

	it("accepts custom base URLs and default headers", async () => {
		const fetch = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
			expect(new Headers(init?.headers).get("x-sdk")).toBe("puckwise");
			expect(new Headers(init?.headers).get("x-request")).toBe("one");
			return jsonResponse({ ok: true });
		});
		const client = createNhlApiClient({
			baseUrls: { web: "https://example.test/web" },
			fetch,
			headers: { "x-sdk": "puckwise" },
		});

		await client.web("/ping", {
			headers: { "x-request": "one" },
			schema: okSchema,
		});

		expect(fetch.mock.calls[0]?.[0].toString()).toBe("https://example.test/web/ping");
	});

	it("interpolates and URL-encodes path parameters", () => {
		expect(
			interpolatePath("/player/{playerName}/game/:gameId", {
				gameId: "2023020001",
				playerName: "Matt Boldy",
			}),
		).toBe("/player/Matt%20Boldy/game/2023020001");
	});

	it("serializes query parameters consistently", () => {
		expect(
			serializeQuery({
				active: true,
				date: new Date("2026-04-18T12:30:00.000Z"),
				empty: undefined,
				ids: [1, 2],
				limit: 50,
				nil: null,
			}),
		).toBe("active=true&date=2026-04-18&ids=1&ids=2&limit=50");
	});

	it("constructs URLs with path parameters and query strings", () => {
		const url = buildUrl({
			baseUrl: "https://api-web.nhle.com/v1",
			path: "/gamecenter/{gameId}/boxscore",
			pathParams: { gameId: 2023020001 },
			query: { lang: "en" },
		});

		expect(url.toString()).toBe(
			"https://api-web.nhle.com/v1/gamecenter/2023020001/boxscore?lang=en",
		);
	});

	it("builds escaped Stats API cayenne expressions", () => {
		expect(
			cayenneAnd(cayenneEq("lastName", 'O"Reilly'), cayenneEq("active", true)),
		).toBe('lastName="O\\"Reilly" and active=true');
	});

	it("wraps non-2xx responses in NhlApiError", async () => {
		const client = createNhlApiClient({
			fetch: async () =>
				new Response("not found", {
					status: 404,
					statusText: "Not Found",
				}),
		});

		await expect(client.web("/missing", { schema: okSchema })).rejects.toMatchObject({
			code: "HTTP_ERROR",
			responseBody: "not found",
			status: 404,
			url: "https://api-web.nhle.com/v1/missing",
		});
	});

	it("wraps invalid JSON responses in NhlApiError", async () => {
		const client = createNhlApiClient({
			fetch: async () => new Response("not json", { status: 200 }),
		});

		await expect(client.web("/bad-json", { schema: okSchema })).rejects.toMatchObject({
			code: "INVALID_JSON",
			responseBody: "not json",
		});
	});

	it("wraps Zod validation failures with schema issues", async () => {
		const client = createNhlApiClient({
			fetch: async () => jsonResponse({ ok: "yes" }),
		});

		await expect(client.web("/invalid", { schema: okSchema })).rejects.toMatchObject({
			code: "VALIDATION_ERROR",
			issues: expect.any(Array),
		});
	});

	it("exposes the parser helper independently", () => {
		expect(parseNhlApiResponse(okSchema, { ok: true })).toEqual({ ok: true });
		expect(() => parseNhlApiResponse(okSchema, { ok: "true" })).toThrow(NhlApiError);
	});

	it("converts request timeouts to typed errors", async () => {
		const client = createNhlApiClient({
			fetch: (_input, init) =>
				new Promise((_resolve, reject) => {
					init?.signal?.addEventListener("abort", () => {
						reject(new DOMException("Aborted", "AbortError"));
					});
				}),
			timeoutMs: 1,
		});

		await expect(client.web("/slow", { schema: okSchema })).rejects.toMatchObject({
			code: "TIMEOUT",
			timeoutMs: 1,
		});
	});

	it("passes caller abort signals through as typed abort errors", async () => {
		const controller = new AbortController();
		const client = createNhlApiClient({
			fetch: (_input, init) =>
				new Promise((_resolve, reject) => {
					init?.signal?.addEventListener("abort", () => {
						reject(new DOMException("Aborted", "AbortError"));
					});
					controller.abort();
				}),
		});

		await expect(
			client.web("/aborted", { schema: okSchema, signal: controller.signal }),
		).rejects.toMatchObject({
			code: "ABORTED",
		});
	});
});
