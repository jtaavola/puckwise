import type { NhlApiClient } from "../client.js";
import { gameTypeSchema, seasonIdSchema } from "../schemas/common.js";
import {
	playerGameLogSchema,
	playerIdSchema,
	playerLandingSchema,
	playerSpotlightSchema,
	statsGoalieStatsResponseSchema,
	statsLeadersResponseSchema,
	statsMilestonesResponseSchema,
	statsPlayerInfoResponseSchema,
	statsSkaterStatsResponseSchema,
} from "../schemas/players.js";
import {
	buildStatsQuery as buildBaseStatsQuery,
	type NhlApiDomainRequestOptions,
	pickLangQuery,
	pickRequestOptions,
	type StatsApiLanguage,
	type StatsApiListParams,
	type StatsApiSortDirection,
	statsPath,
} from "./common.js";

export type {
	NhlApiDomainRequestOptions,
	StatsApiLanguage,
	StatsApiListParams,
	StatsApiSortDirection,
};

export type PlayerLandingOptions = NhlApiDomainRequestOptions & {
	lang?: string;
};

export type PlayerGameLogParams = NhlApiDomainRequestOptions & {
	season: number;
	gameType: number;
	lang?: string;
};

export type PlayerSearchParams = StatsApiListParams & {
	active?: boolean;
	currentTeamId?: number;
	firstName?: string;
	lastName?: string;
	playerId?: number;
	positionCode?: string;
};

export type PlayerInfoOptions = NhlApiDomainRequestOptions & {
	lang?: StatsApiLanguage;
};

export type PlayerStatsParams = StatsApiListParams & {
	factCayenneExp?: string;
	gameType?: number;
	isAggregate?: boolean;
	isGame?: boolean;
	playerId?: number;
	positionCode?: string;
	report?: string;
	season?: number;
	teamId?: number;
};

export type PlayerLeaderParams = StatsApiListParams & {
	attribute: string;
};

export type PlayerMilestoneParams = StatsApiListParams & {
	kind: "skaters" | "goalies";
};

export type PlayerSpotlightParams = NhlApiDomainRequestOptions & {
	lang?: string;
};

export type PlayersDomain = ReturnType<typeof createPlayersDomain>;

export function createPlayersDomain(client: NhlApiClient) {
	return {
		getLanding(playerId: number, options: PlayerLandingOptions = {}) {
			return client.web("/player/{playerId}/landing", {
				...pickRequestOptions(options),
				pathParams: { playerId: parsePlayerId(playerId) },
				query: pickLangQuery(options),
				schema: playerLandingSchema,
			});
		},

		getGameLog(playerId: number, params: PlayerGameLogParams) {
			return client.web("/player/{playerId}/game-log/{season}/{gameType}", {
				...pickRequestOptions(params),
				pathParams: {
					gameType: parseGameType(params.gameType),
					playerId: parsePlayerId(playerId),
					season: parseSeason(params.season),
				},
				query: pickLangQuery(params),
				schema: playerGameLogSchema,
			});
		},

		search(params: PlayerSearchParams = {}) {
			return client.stats(statsPath(params.lang, "/players"), {
				...pickRequestOptions(params),
				query: buildStatsQuery(params, {
					active: params.active,
					currentTeamId: params.currentTeamId,
					firstName: params.firstName,
					id: params.playerId,
					lastName: params.lastName,
					positionCode: params.positionCode,
				}),
				schema: statsPlayerInfoResponseSchema,
			});
		},

		getInfo(playerId: number, options: PlayerInfoOptions = {}) {
			return client.stats(statsPath(options.lang, "/players"), {
				...pickRequestOptions(options),
				query: buildStatsQuery({}, { id: parsePlayerId(playerId) }),
				schema: statsPlayerInfoResponseSchema,
			});
		},

		getSkaterStats(params: PlayerStatsParams = {}) {
			return client.stats(statsPath(params.lang, "/skater/{report}"), {
				...pickRequestOptions(params),
				pathParams: {
					report: params.report ?? "summary",
				},
				query: buildStatsQuery(params, statsFilters(params)),
				schema: statsSkaterStatsResponseSchema,
			});
		},

		getGoalieStats(params: PlayerStatsParams = {}) {
			return client.stats(statsPath(params.lang, "/goalie/{report}"), {
				...pickRequestOptions(params),
				pathParams: {
					report: params.report ?? "summary",
				},
				query: buildStatsQuery(params, statsFilters(params)),
				schema: statsGoalieStatsResponseSchema,
			});
		},

		getSkaterLeaders(params: PlayerLeaderParams) {
			return client.stats(
				statsPath(params.lang, "/leaders/skaters/{attribute}"),
				{
					...pickRequestOptions(params),
					pathParams: {
						attribute: params.attribute,
					},
					query: buildStatsQuery(params),
					schema: statsLeadersResponseSchema,
				},
			);
		},

		getGoalieLeaders(params: PlayerLeaderParams) {
			return client.stats(
				statsPath(params.lang, "/leaders/goalies/{attribute}"),
				{
					...pickRequestOptions(params),
					pathParams: {
						attribute: params.attribute,
					},
					query: buildStatsQuery(params),
					schema: statsLeadersResponseSchema,
				},
			);
		},

		getMilestones(params: PlayerMilestoneParams) {
			return client.stats(statsPath(params.lang, "/milestones/{kind}"), {
				...pickRequestOptions(params),
				pathParams: {
					kind: params.kind,
				},
				query: buildStatsQuery(params),
				schema: statsMilestonesResponseSchema,
			});
		},

		getSpotlight(params: PlayerSpotlightParams = {}) {
			return client.web("/player-spotlight", {
				...pickRequestOptions(params),
				query: pickLangQuery(params),
				schema: playerSpotlightSchema,
			});
		},
	};
}

function parsePlayerId(playerId: number): number {
	return playerIdSchema.parse(playerId);
}

function parseSeason(season: number): number {
	return seasonIdSchema.parse(season);
}

function parseGameType(gameType: number): number {
	return gameTypeSchema.parse(gameType);
}

function buildStatsQuery(
	params: StatsApiListParams | PlayerStatsParams,
	filters: Record<string, string | number | boolean | undefined> = {},
): ReturnType<typeof buildBaseStatsQuery> {
	return {
		...buildBaseStatsQuery(params, filters),
		factCayenneExp:
			"factCayenneExp" in params ? params.factCayenneExp : undefined,
		isAggregate: "isAggregate" in params ? params.isAggregate : undefined,
		isGame: "isGame" in params ? params.isGame : undefined,
	};
}

function statsFilters(
	params: PlayerStatsParams,
): Record<string, string | number | boolean | undefined> {
	return {
		gameTypeId:
			params.gameType === undefined
				? undefined
				: parseGameType(params.gameType),
		playerId:
			params.playerId === undefined
				? undefined
				: parsePlayerId(params.playerId),
		positionCode: params.positionCode,
		seasonId:
			params.season === undefined ? undefined : parseSeason(params.season),
		teamId: params.teamId,
	};
}
