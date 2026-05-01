import { tool } from "ai";
import { z } from "zod";
import {
	createNhlApiClient,
	type PlayerLanding,
	type StatsPlayerInfo,
} from "@puckwise/nhl-api";

const nhlApi = createNhlApiClient();

type NhlPlayerSearchResult = {
	id: number;
	fullName: string;
	firstName: string;
	lastName: string;
	currentTeamId?: number;
	positionCode?: string;
	sweaterNumber?: number;
};

type NhlSeasonTotal = NonNullable<PlayerLanding["seasonTotals"]>[number];

type NormalizedNhlPlayerLanding = Omit<
	PlayerLanding,
	| "firstName"
	| "fullTeamName"
	| "isActive"
	| "lastName"
	| "playerId"
	| "seasonTotals"
	| "sweaterNumber"
> & {
	playerId: number;
	isActive: boolean;
	currentTeamId?: number;
	currentTeamAbbrev?: string;
	fullTeamName?: { default?: string };
	firstName: { default: string };
	lastName: { default: string };
	sweaterNumber?: number;
	position?: string;
	featuredStats?: unknown;
	careerTotals?: unknown;
	seasonTotals: NhlSeasonTotal[];
};

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
	execute: async ({ lastName, firstName }): Promise<NhlPlayerSearchResult[]> => {
		const response = await nhlApi.players.search({ firstName, lastName });

		return response.data.map((player) => ({
			id: player.playerId,
			fullName:
				player.fullName ??
				[player.firstName, player.lastName].filter(Boolean).join(" "),
			firstName: player.firstName ?? "",
			lastName: player.lastName ?? "",
			currentTeamId: player.currentTeamId ?? undefined,
			positionCode: player.positionCode,
			sweaterNumber: getSweaterNumber(player),
		}));
	},
});

// ─── Tool 2: Get Player Landing ───────────────────────────────────────

const playerLandingOutputSchema = z
	.object({
		playerId: z.number(),
		firstName: z.object({ default: z.string() }),
		lastName: z.object({ default: z.string() }),
		isActive: z.boolean(),
		currentTeamId: z.number().optional(),
		currentTeamAbbrev: z.string().optional(),
		position: z.string().optional(),
		sweaterNumber: z.number().optional(),
		seasonTotals: z.array(
			z
				.object({
					season: z.number().optional(),
					leagueAbbrev: z.string().optional(),
					gameTypeId: z.number().optional(),
					gamesPlayed: z.number().nullable().optional(),
					goals: z.number().nullable().optional(),
					assists: z.number().nullable().optional(),
					points: z.number().nullable().optional(),
					teamName: z
						.object({ default: z.string().optional() })
						.or(z.string())
						.optional(),
					teamCommonName: z
						.object({ default: z.string().optional() })
						.or(z.string())
						.optional(),
				})
				.passthrough(),
		),
	})
	.passthrough();

type PlayerLandingToolOutput = z.infer<typeof playerLandingOutputSchema>;

export const getNhlPlayerLanding = tool({
	description:
		"Fetch an NHL player's full profile and season-by-season statistics from the NHL API. Use this after resolving a player ID to get their career and season totals.",
	inputSchema: z.object({
		playerId: z
			.number()
			.describe("The NHL player ID (e.g. 8481557 for Matt Boldy)"),
	}),
	outputSchema: playerLandingOutputSchema,
	execute: async ({ playerId }): Promise<PlayerLandingToolOutput> => {
		const landing = await nhlApi.players.getLanding(playerId);

		return {
			...landing,
			firstName: normalizeLocaleName(landing.firstName),
			fullTeamName: normalizeOptionalLocaleName(landing.fullTeamName),
			isActive: Boolean(landing.isActive),
			lastName: normalizeLocaleName(landing.lastName),
			playerId: landing.playerId ?? playerId,
			seasonTotals: landing.seasonTotals ?? [],
			sweaterNumber:
				typeof landing.sweaterNumber === "number"
					? landing.sweaterNumber
					: undefined,
		} satisfies NormalizedNhlPlayerLanding;
	},
});

function getSweaterNumber(player: StatsPlayerInfo): number | undefined {
	const sweaterNumber = player.sweaterNumber;
	return typeof sweaterNumber === "number" ? sweaterNumber : undefined;
}

function normalizeLocaleName(
	name: PlayerLanding["firstName"] | PlayerLanding["lastName"],
): { default: string } {
	if (typeof name === "string") {
		return { default: name };
	}

	return { default: name?.default ?? "" };
}

function normalizeOptionalLocaleName(
	name: PlayerLanding["fullTeamName"],
): { default?: string } | undefined {
	if (typeof name === "string") {
		return { default: name };
	}

	return name;
}
