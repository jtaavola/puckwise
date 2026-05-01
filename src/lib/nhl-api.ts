import {
	createNhlApiClient,
	type PlayerLanding,
	type StatsPlayerInfo,
} from "@puckwise/nhl-api";

const nhlApi = createNhlApiClient();

export type NhlPlayerSearchResult = {
	id: number;
	fullName: string;
	firstName: string;
	lastName: string;
	currentTeamId?: number;
	positionCode?: string;
	sweaterNumber?: number;
};

export type NhlSeasonTotal = NonNullable<PlayerLanding["seasonTotals"]>[number];

export type NhlPlayerLanding = Omit<
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

/**
 * Search for NHL players by last name, optionally narrowed by first name.
 */
export async function searchNhlPlayers(
	lastName: string,
	firstName?: string,
): Promise<NhlPlayerSearchResult[]> {
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
}

/**
 * Fetch player landing data including season totals.
 */
export async function getNhlPlayerLanding(
	playerId: number,
): Promise<NhlPlayerLanding> {
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
	};
}

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

/**
 * Determine the current NHL season based on the current date.
 * NHL seasons span two calendar years (Oct–Apr).
 * Returns a season identifier like 20242025.
 */
export function getCurrentNhlSeason(): number {
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth() + 1; // 1-indexed

	if (month >= 7) {
		// July or later: current season is year-(year+1)
		return year * 10_000 + (year + 1);
	}
	// Jan–June: current season is (year-1)-year
	return (year - 1) * 10_000 + year;
}

/**
 * Get the previous completed NHL season.
 */
export function getPreviousCompletedNhlSeason(): number {
	const current = getCurrentNhlSeason();
	const startYear = Math.floor(current / 10_000) - 1;
	return startYear * 10_000 + (startYear + 1);
}

/**
 * Format a season identifier like 20242025 into a human-readable string.
 */
export function formatNhlSeason(season: number): string {
	const start = Math.floor(season / 10_000);
	const end = season % 10_000;
	return `${start}–${String(end).slice(2)}`;
}
