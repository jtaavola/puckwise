import type { NhlApiClient } from "../client.js";
import { NhlApiError } from "../errors.js";
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
import {
	buildStatsQuery,
	type NhlApiDomainRequestOptions,
	pickLangQuery,
	pickRequestOptions,
	type StatsApiLanguage,
	type StatsApiListParams,
	statsPath,
} from "./common.js";

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

export function createGamesDomain(client: NhlApiClient) {
	return {
		/** Retrieve daily scores as of now or for a specific date. */
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

		/** Retrieve the overall scoreboard, or a specific team's current scoreboard. */
		getScoreboard(params: ScoreboardParams = {}) {
			const path = params.team ? "/scoreboard/{team}/now" : "/scoreboard/now";
			return client.web(path, {
				...pickRequestOptions(params),
				pathParams: params.team ? { team: parseTeamAbbrev(params.team) } : {},
				query: pickLangQuery(params),
				schema: scoreboardResponseSchema,
			});
		},

		/** Retrieve landing information for a specific game. */
		getLanding(gameId: number, options: GameLanguageOptions = {}) {
			return client.web("/gamecenter/{gameId}/landing", {
				...pickRequestOptions(options),
				pathParams: { gameId: parseGameId(gameId) },
				query: pickLangQuery(options),
				schema: gameLandingSchema,
			});
		},

		/** Retrieve boxscore information for a specific game. */
		getBoxscore(gameId: number, options: GameLanguageOptions = {}) {
			return client.web("/gamecenter/{gameId}/boxscore", {
				...pickRequestOptions(options),
				pathParams: { gameId: parseGameId(gameId) },
				query: pickLangQuery(options),
				schema: gameBoxscoreSchema,
			});
		},

		/** Retrieve play-by-play information for a specific game. */
		getPlayByPlay(gameId: number, options: GameLanguageOptions = {}) {
			return client.web("/gamecenter/{gameId}/play-by-play", {
				...pickRequestOptions(options),
				pathParams: { gameId: parseGameId(gameId) },
				query: pickLangQuery(options),
				schema: gamePlayByPlaySchema,
			});
		},

		/** Retrieve game story information for a specific game. */
		getStory(gameId: number, options: GameLanguageOptions = {}) {
			return client.web("/wsc/game-story/{gameId}", {
				...pickRequestOptions(options),
				pathParams: { gameId: parseGameId(gameId) },
				query: pickLangQuery(options),
				schema: gameStorySchema,
			});
		},

		/** Retrieve game information from the Stats API. */
		getInfo(params: StatsGameInfoParams = {}) {
			return client.stats(statsPath(params.lang, "/game"), {
				...pickRequestOptions(params),
				query: buildStatsQuery(params, statsGameFilters(params)),
				schema: statsGameInfoResponseSchema,
			});
		},

		/** Retrieve metadata for games from the Stats API. */
		getMetadata(params: StatsGameMetadataParams = {}) {
			return client.stats(statsPath(params.lang, "/game/meta"), {
				...pickRequestOptions(params),
				schema: statsGameMetadataResponseSchema,
			});
		},

		/** Retrieve shift charts for a specific game. */
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

		/** Retrieve information about streaming options. */
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

		/** Retrieve the current TV schedule or the TV schedule for a specific date. */
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

		/** Retrieve partner game odds for a country as of the current moment. */
		getOdds(params: OddsParams) {
			return client.web("/partner-game/{countryCode}/now", {
				...pickRequestOptions(params),
				pathParams: { countryCode: parseCountryCode(params.countryCode) },
				query: pickLangQuery(params),
				schema: oddsResponseSchema,
			});
		},

		/** Retrieve a goal or play replay for a specific game event. */
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

		/** Retrieve WSC play-by-play content for a specific game. */
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

function statsGameFilters(
	params: StatsGameInfoParams,
): Record<string, string | number | boolean | undefined> {
	return {
		awayTeamId: params.awayTeamId,
		id: params.gameId === undefined ? undefined : parseGameId(params.gameId),
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
