import { tool } from "ai";
import { z } from "zod";
import {
	getNhlPlayerLanding as getNhlPlayerLandingApi,
	type NhlPlayerLanding,
	type NhlPlayerSearchResult,
	searchNhlPlayers as searchNhlPlayersApi,
} from "#/lib/nhl-api";

// ─── Tool 1: Search Players ───────────────────────────────────────────

export const searchNhlPlayers = tool({
	description:
		"Search for NHL players by last name. Returns a list of matching players with IDs, names, team, and position. Use this when the user mentions a player by name and you need to resolve it to a player ID.",
	inputSchema: z.object({
		lastName: z.string().describe("The player's last name (e.g. 'Boldy')"),
	}),
	outputSchema: z.array(
		z.object({
			id: z.number(),
			fullName: z.string(),
			firstName: z.string(),
			lastName: z.string(),
			currentTeamId: z.number().optional(),
			positionCode: z.string().optional(),
			sweaterNumber: z.number().optional(),
		}),
	),
	execute: async ({ lastName }): Promise<NhlPlayerSearchResult[]> => {
		return searchNhlPlayersApi(lastName);
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
	outputSchema: z.object({
		playerId: z.number(),
		firstName: z.object({ default: z.string() }),
		lastName: z.object({ default: z.string() }),
		isActive: z.boolean(),
		currentTeamId: z.number().optional(),
		currentTeamAbbrev: z.string().optional(),
		position: z.string().optional(),
		sweaterNumber: z.number().optional(),
		seasonTotals: z.array(
			z.object({
				season: z.number(),
				leagueAbbrev: z.string(),
				gameTypeId: z.number(),
				gamesPlayed: z.number(),
				goals: z.number(),
				assists: z.number(),
				points: z.number(),
				teamName: z.object({ default: z.string().optional() }).optional(),
				teamCommonName: z.object({ default: z.string().optional() }).optional(),
			}),
		),
	}),
	execute: async ({ playerId }): Promise<NhlPlayerLanding> => {
		return getNhlPlayerLandingApi(playerId);
	},
});
