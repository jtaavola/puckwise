import type { NhlApiClient } from "../client.js";
import { NhlApiError } from "../errors.js";
import { cayenneAnd, cayenneEq, type QueryParams } from "../http.js";
import { gameIdSchema, seasonIdSchema } from "../schemas/common.js";
import {
	gameBoxscoreSchema,
	gameLandingSchema,
	gamePlayByPlaySchema,
	gameStorySchema,
	gameTypeIdSchema,
	oddsResponseSchema,
	replayResponseSchema,
	scoreboardResponseSchema,
	scoresResponseSchema,
	statsGameInfoResponseSchema,
	statsGameMetadataResponseSchema,
	statsShiftChartsResponseSchema,
	streamsResponseSchema,
	tvScheduleResponseSchema,
	wscPlayByPlayResponseSchema,
} from "../schemas/games.js";
import type {
	NhlApiDomainRequestOptions,
	StatsApiLanguage,
	StatsApiListParams,
	StatsApiSortDirection,
} from "./players.js";

export type GameDate = string | Date;

export type GameLanguageOptions = NhlApiDomainRequestOptions & {
	lang?: string;
};

export type ScoresParams = GameLanguageOptions & {
	date?: GameDate;
};

export type ScoreboardParams = GameLanguageOptions & {
	team?: string;
};

export type StatsGameInfoParams = StatsApiListParams & {
	awayTeamId?: number;
	gameId?: number;
	gameStateId?: number;
	gameType?: number;
	homeTeamId?: number;
	season?: number;
};

export type StatsGameMetadataParams = NhlApiDomainRequestOptions & {
	lang?: StatsApiLanguage;
};

export type ShiftChartsParams = StatsApiListParams & {
	gameId: number;
	playerId?: number;
	teamAbbrev?: string;
};

export type StreamsParams = NhlApiDomainRequestOptions & {
	include?: string;
	lang?: string;
};

export type TvScheduleParams = GameLanguageOptions & {
	date?: GameDate;
};

export type OddsParams = GameLanguageOptions & {
	countryCode: string;
};

export type ReplaysParams = GameLanguageOptions & {
	eventNumber: number;
	gameId: number;
	kind?: "goal" | "play";
};

export type WscPlayByPlayParams = GameLanguageOptions & {
	gameId: number;
};

export type GamesDomain = ReturnType<typeof createGamesDomain>;

type StatsFilterValue = string | number | boolean;

export function createGamesDomain(client: NhlApiClient) {
	return {
		getScores(params: ScoresParams = {}) {
			const pathDate =
				params.date === undefined ? "now" : formatDate(params.date);
			return client.web("/score/{date}", {
				...pickRequestOptions(params),
				pathParams: { date: pathDate },
				query: pickLangQuery(params),
				schema: scoresResponseSchema,
			});
		},

		getScoreboard(params: ScoreboardParams = {}) {
			const path = params.team ? "/scoreboard/{team}/now" : "/scoreboard/now";
			return client.web(path, {
				...pickRequestOptions(params),
				pathParams: params.team ? { team: parseTeamAbbrev(params.team) } : {},
				query: pickLangQuery(params),
				schema: scoreboardResponseSchema,
			});
		},

		getLanding(gameId: number, options: GameLanguageOptions = {}) {
			return client.web("/gamecenter/{gameId}/landing", {
				...pickRequestOptions(options),
				pathParams: { gameId: parseGameId(gameId) },
				query: pickLangQuery(options),
				schema: gameLandingSchema,
			});
		},

		getBoxscore(gameId: number, options: GameLanguageOptions = {}) {
			return client.web("/gamecenter/{gameId}/boxscore", {
				...pickRequestOptions(options),
				pathParams: { gameId: parseGameId(gameId) },
				query: pickLangQuery(options),
				schema: gameBoxscoreSchema,
			});
		},

		getPlayByPlay(gameId: number, options: GameLanguageOptions = {}) {
			return client.web("/gamecenter/{gameId}/play-by-play", {
				...pickRequestOptions(options),
				pathParams: { gameId: parseGameId(gameId) },
				query: pickLangQuery(options),
				schema: gamePlayByPlaySchema,
			});
		},

		getStory(gameId: number, options: GameLanguageOptions = {}) {
			return client.web("/wsc/game-story/{gameId}", {
				...pickRequestOptions(options),
				pathParams: { gameId: parseGameId(gameId) },
				query: pickLangQuery(options),
				schema: gameStorySchema,
			});
		},

		getInfo(params: StatsGameInfoParams = {}) {
			return client.stats(statsPath(params.lang, "/game"), {
				...pickRequestOptions(params),
				query: buildStatsQuery(params, statsGameFilters(params)),
				schema: statsGameInfoResponseSchema,
			});
		},

		getMetadata(params: StatsGameMetadataParams = {}) {
			return client.stats(statsPath(params.lang, "/game/meta"), {
				...pickRequestOptions(params),
				schema: statsGameMetadataResponseSchema,
			});
		},

		getShiftCharts(params: ShiftChartsParams) {
			return client.stats(statsPath(params.lang, "/shiftcharts"), {
				...pickRequestOptions(params),
				query: buildStatsQuery(params, {
					gameId: parseGameId(params.gameId),
					playerId: params.playerId,
					teamAbbrev: params.teamAbbrev,
				}),
				schema: statsShiftChartsResponseSchema,
			});
		},

		getStreams(params: StreamsParams = {}) {
			return client.web("/where-to-watch", {
				...pickRequestOptions(params),
				query: {
					include: params.include,
					lang: params.lang,
				},
				schema: streamsResponseSchema,
			});
		},

		getTvSchedule(params: TvScheduleParams = {}) {
			const pathDate =
				params.date === undefined ? "now" : formatDate(params.date);
			return client.web("/network/tv-schedule/{date}", {
				...pickRequestOptions(params),
				pathParams: { date: pathDate },
				query: pickLangQuery(params),
				schema: tvScheduleResponseSchema,
			});
		},

		getOdds(params: OddsParams) {
			return client.web("/partner-game/{countryCode}/now", {
				...pickRequestOptions(params),
				pathParams: { countryCode: parseCountryCode(params.countryCode) },
				query: pickLangQuery(params),
				schema: oddsResponseSchema,
			});
		},

		getReplays(params: ReplaysParams) {
			const path =
				params.kind === "goal"
					? "/ppt-replay/goal/{gameId}/{eventNumber}"
					: "/ppt-replay/{gameId}/{eventNumber}";
			return client.web(path, {
				...pickRequestOptions(params),
				pathParams: {
					eventNumber: parsePositiveInt(params.eventNumber, "eventNumber"),
					gameId: parseGameId(params.gameId),
				},
				query: pickLangQuery(params),
				schema: replayResponseSchema,
			});
		},

		getWscPlayByPlay(params: WscPlayByPlayParams) {
			return client.web("/wsc/play-by-play/{gameId}", {
				...pickRequestOptions(params),
				pathParams: { gameId: parseGameId(params.gameId) },
				query: pickLangQuery(params),
				schema: wscPlayByPlayResponseSchema,
			});
		},
	};
}

function parseGameId(gameId: number): number {
	return gameIdSchema.parse(gameId);
}

function parseSeason(season: number): number {
	return seasonIdSchema.parse(season);
}

function parseGameType(gameType: number): number {
	return gameTypeIdSchema.parse(gameType);
}

function pickRequestOptions(
	options: NhlApiDomainRequestOptions,
): NhlApiDomainRequestOptions {
	return {
		headers: options.headers,
		signal: options.signal,
		timeoutMs: options.timeoutMs,
	};
}

function pickLangQuery(options: { lang?: string }): QueryParams {
	return { lang: options.lang };
}

function formatDate(date: GameDate): string {
	if (date instanceof Date) {
		return date.toISOString().slice(0, 10);
	}

	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		throw new NhlApiError({
			code: "VALIDATION_ERROR",
			message: `Invalid game date "${date}". Expected YYYY-MM-DD.`,
		});
	}

	return date;
}

function parseTeamAbbrev(team: string): string {
	const normalized = team.toUpperCase();
	if (!/^[A-Z]{2,3}$/.test(normalized)) {
		throw new NhlApiError({
			code: "VALIDATION_ERROR",
			message: `Invalid team abbreviation "${team}"`,
		});
	}

	return normalized;
}

function parseCountryCode(countryCode: string): string {
	const normalized = countryCode.toUpperCase();
	if (!/^[A-Z]{2}$/.test(normalized)) {
		throw new NhlApiError({
			code: "VALIDATION_ERROR",
			message: `Invalid country code "${countryCode}"`,
		});
	}

	return normalized;
}

function parsePositiveInt(value: number, field: string): number {
	if (!Number.isInteger(value) || value <= 0) {
		throw new NhlApiError({
			code: "VALIDATION_ERROR",
			message: `${field} must be a positive integer`,
		});
	}

	return value;
}

function statsPath(lang: StatsApiLanguage | undefined, path: string): string {
	if (!lang || lang === "en") {
		return path;
	}

	const encodedLang = encodeStatsApiLanguage(lang);
	return `/../${encodedLang}${path}`;
}

function encodeStatsApiLanguage(lang: StatsApiLanguage): string {
	if (!/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(lang)) {
		throw new NhlApiError({
			code: "VALIDATION_ERROR",
			message: `Invalid Stats API language "${lang}"`,
		});
	}

	return encodeURIComponent(lang);
}

function buildStatsQuery(
	params: StatsApiListParams,
	filters: Record<string, StatsFilterValue | undefined> = {},
): QueryParams {
	const expressions = Object.entries(filters)
		.filter((entry): entry is [string, StatsFilterValue] => {
			return entry[1] !== undefined;
		})
		.map(([field, value]) => cayenneEq(field, value));
	const cayenneExp = cayenneAnd(...expressions, params.cayenneExp ?? "");

	return {
		cayenneExp: cayenneExp || undefined,
		dir: params.dir as StatsApiSortDirection | undefined,
		exclude: params.exclude,
		include: params.include,
		limit: params.limit,
		sort: params.sort,
		start: params.start,
	};
}

function statsGameFilters(
	params: StatsGameInfoParams,
): Record<string, StatsFilterValue | undefined> {
	return {
		awayTeamId: params.awayTeamId,
		id:
			params.gameId === undefined ? undefined : parseGameId(params.gameId),
		gameStateId: params.gameStateId,
		gameType:
			params.gameType === undefined
				? undefined
				: parseGameType(params.gameType),
		homeTeamId: params.homeTeamId,
		season:
			params.season === undefined ? undefined : parseSeason(params.season),
	};
}
