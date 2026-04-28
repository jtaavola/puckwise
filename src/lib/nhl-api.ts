// NHL API helper functions

const NHLE_STATS_BASE = "https://api.nhle.com/stats/rest/en";
const NHLE_WEB_BASE = "https://api-web.nhle.com/v1";
const FETCH_TIMEOUT_MS = 10_000;

export type NhlPlayerSearchResult = {
	id: number;
	fullName: string;
	firstName: string;
	lastName: string;
	currentTeamId?: number;
	positionCode?: string;
	sweaterNumber?: number;
};

export type NhlSeasonTotal = {
	assists: number;
	avgToi?: string;
	faceoffWinningPctg?: number;
	gameTypeId: number;
	gameWinningGoals?: number;
	gamesPlayed: number;
	goals: number;
	leagueAbbrev: string;
	otGoals?: number;
	pim?: number;
	plusMinus?: number;
	points: number;
	powerPlayGoals?: number;
	powerPlayPoints?: number;
	season: number;
	sequence: number;
	shootingPctg?: number;
	shorthandedGoals?: number;
	shorthandedPoints?: number;
	shots?: number;
	teamCommonName?: { default?: string };
	teamName?: { default?: string; fr?: string };
	teamPlaceNameWithPreposition?: { default?: string; fr?: string };
};

export type NhlPlayerLanding = {
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

type StatsApiResponse = {
	data: Array<{
		id: number;
		fullName: string;
		firstName: string;
		lastName: string;
		currentTeamId?: number | null;
		positionCode?: string;
		sweaterNumber?: number | null;
	}>;
	total: number;
};

async function fetchWithTimeout(
	url: string,
	options?: RequestInit,
	timeoutMs = FETCH_TIMEOUT_MS,
): Promise<Response> {
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const response = await fetch(url, {
			...options,
			signal: controller.signal,
		});
		return response;
	} finally {
		clearTimeout(id);
	}
}

/**
 * Search for NHL players by last name.
 */
export async function searchNhlPlayers(
	lastName: string,
): Promise<NhlPlayerSearchResult[]> {
	const encodedName = encodeURIComponent(lastName);
	const url = `${NHLE_STATS_BASE}/players?cayenneExp=lastName=%22${encodedName}%22`;

	const response = await fetchWithTimeout(url);
	if (!response.ok) {
		throw new Error(
			`NHL stats API error: ${response.status} ${response.statusText}`,
		);
	}

	const json = (await response.json()) as StatsApiResponse;

	return (json.data || []).map((player) => ({
		id: player.id,
		fullName: player.fullName,
		firstName: player.firstName,
		lastName: player.lastName,
		currentTeamId: player.currentTeamId ?? undefined,
		positionCode: player.positionCode,
		sweaterNumber: player.sweaterNumber ?? undefined,
	}));
}

/**
 * Fetch player landing data including season totals.
 */
export async function getNhlPlayerLanding(
	playerId: number,
): Promise<NhlPlayerLanding> {
	const url = `${NHLE_WEB_BASE}/player/${playerId}/landing`;

	const response = await fetchWithTimeout(url);
	if (!response.ok) {
		throw new Error(
			`NHL web API error: ${response.status} ${response.statusText}`,
		);
	}

	const json = (await response.json()) as NhlPlayerLanding;
	return json;
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
