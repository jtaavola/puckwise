import {
	createNhlApiClient,
	playerLandingSchema,
	statsPlayerInfoSchema,
} from "@puckwise/nhl-api";
import { tool } from "ai";
import { z } from "zod";

const nhlApi = createNhlApiClient();

// ─── Tool 1: Search Players ───────────────────────────────────────────

export const searchNhlPlayers = tool({
	description:
		"Search for NHL players by last name, optionally narrowed by first name. Returns a list of matching players with IDs, names, team, and position. Use this when the user mentions a player by name and you need to resolve it to a player ID.",
	inputSchema: z.object({
		lastName: z.string().describe("The player's last name (e.g. 'Boldy')"),
		firstName: z
			.string()
			.optional()
			.describe("The player's first name, if known (e.g. 'Matt')"),
	}),
	outputSchema: z.array(statsPlayerInfoSchema),
	execute: async ({ lastName, firstName }) => {
		const response = await nhlApi.players.search({ firstName, lastName });
		return response.data;
	},
});

// ─── Tool 2: Get Player Landing ───────────────────────────────────────

export const getNhlPlayerLanding = tool({
	description:
		"Fetch an NHL player's full profile and season-by-season statistics from the NHL API. Use this after resolving a player ID to get their career and season totals.",
	inputSchema: z.object({
		playerId: z
			.number()
			.describe("The NHL player ID (e.g. 8481557 for Matt Boldy)"),
	}),
	outputSchema: playerLandingSchema,
	execute: async ({ playerId }) => nhlApi.players.getLanding(playerId),
});
