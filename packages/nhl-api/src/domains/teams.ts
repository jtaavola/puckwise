import type { NhlApiClient } from "../client.js";
import { NhlApiError } from "../errors.js";
import type { PathParams } from "../http.js";
import {
	gameTypeSchema,
	seasonIdSchema,
	teamAbbrevSchema,
	teamIdSchema,
} from "../schemas/common.js";
import {
	clubStatsSchema,
	prospectsSchema,
	rosterSchema,
	standingsSchema,
	statsFranchiseResponseSchema,
	statsTeamInfoResponseSchema,
	statsTeamStatsResponseSchema,
	teamScheduleSchema,
	teamScoreboardSchema,
} from "../schemas/teams.js";
import {
	buildStatsQuery,
	type NhlApiDomainRequestOptions,
	pickLangQuery,
	pickRequestOptions,
	type StatsApiLanguage,
	type StatsApiListParams,
	statsPath,
} from "./common.js";

export type StandingsParams = NhlApiDomainRequestOptions & {
	date?: Date | string;
	lang?: string;
};

export type ClubStatsParams = NhlApiDomainRequestOptions & {
	gameType?: number;
	lang?: string;
	season?: number;
};

export type TeamRosterParams = NhlApiDomainRequestOptions & {
	lang?: string;
	season?: number;
};

export type TeamProspectsParams = NhlApiDomainRequestOptions & {
	lang?: string;
};

export type TeamScheduleParams = NhlApiDomainRequestOptions & {
	lang?: string;
	month?: string;
	season?: number;
	weekDate?: Date | string;
};

export type TeamScoreboardParams = NhlApiDomainRequestOptions & {
	lang?: string;
};

export type TeamInfoParams = StatsApiListParams & {
	franchiseId?: number;
	teamId?: number;
};

export type TeamByIdOptions = NhlApiDomainRequestOptions & {
	lang?: StatsApiLanguage;
};

export type TeamStatsParams = StatsApiListParams & {
	gameType?: number;
	report?: string;
	season?: number;
	teamId?: number;
};

export type FranchiseParams = StatsApiListParams & {
	franchiseId?: number;
};

export type TeamsDomain = ReturnType<typeof createTeamsDomain>;

export function createTeamsDomain(client: NhlApiClient) {
	return {
		/** Retrieve NHL standings as of now or for a specific date. */
		getStandings(params: StandingsParams = {}) {
			return client.web("/standings/{date}", {
				...pickRequestOptions(params),
				pathParams: { date: params.date ? formatDate(params.date) : "now" },
				query: pickLangQuery(params),
				schema: standingsSchema,
			});
		},

		/** Retrieve current or season/game-type statistics for a specific club. */
		getClubStats(teamAbbrev: string, params: ClubStatsParams = {}) {
			const hasSeasonAndGameType =
				params.season !== undefined && params.gameType !== undefined;
			if ((params.season === undefined) !== (params.gameType === undefined)) {
				throw new NhlApiError({
					code: "VALIDATION_ERROR",
					message: "Club stats require both season and gameType, or neither.",
				});
			}

			return client.web(
				hasSeasonAndGameType
					? "/club-stats/{teamAbbrev}/{season}/{gameType}"
					: "/club-stats/{teamAbbrev}/now",
				{
					...pickRequestOptions(params),
					pathParams: buildClubStatsPathParams(teamAbbrev, params),
					query: pickLangQuery(params),
					schema: clubStatsSchema,
				},
			);
		},

		/** Retrieve the current roster or season roster for a specific team. */
		getRoster(teamAbbrev: string, params: TeamRosterParams = {}) {
			return client.web(
				params.season === undefined
					? "/roster/{teamAbbrev}/current"
					: "/roster/{teamAbbrev}/{season}",
				{
					...pickRequestOptions(params),
					pathParams: buildRosterPathParams(teamAbbrev, params),
					query: pickLangQuery(params),
					schema: rosterSchema,
				},
			);
		},

		/** Retrieve prospects for a specific team. */
		getProspects(teamAbbrev: string, params: TeamProspectsParams = {}) {
			return client.web("/prospects/{teamAbbrev}", {
				...pickRequestOptions(params),
				pathParams: { teamAbbrev: parseTeamAbbrev(teamAbbrev) },
				query: pickLangQuery(params),
				schema: prospectsSchema,
			});
		},

		/** Retrieve a team's season, month, or week schedule. */
		getSchedule(teamAbbrev: string, params: TeamScheduleParams = {}) {
			return client.web(getSchedulePath(params), {
				...pickRequestOptions(params),
				pathParams: buildSchedulePathParams(teamAbbrev, params),
				query: pickLangQuery(params),
				schema: teamScheduleSchema,
			});
		},

		/** Retrieve the current scoreboard for a specific team. */
		getScoreboard(teamAbbrev: string, params: TeamScoreboardParams = {}) {
			return client.web("/scoreboard/{teamAbbrev}/now", {
				...pickRequestOptions(params),
				pathParams: { teamAbbrev: parseTeamAbbrev(teamAbbrev) },
				query: pickLangQuery(params),
				schema: teamScoreboardSchema,
			});
		},

		/** Retrieve a list of teams from the Stats API. */
		getInfo(params: TeamInfoParams = {}) {
			return client.stats(statsPath(params.lang, "/team"), {
				...pickRequestOptions(params),
				query: buildStatsQuery(params, {
					franchiseId: params.franchiseId,
					id: params.teamId,
				}),
				schema: statsTeamInfoResponseSchema,
			});
		},

		/** Retrieve Stats API information for a specific team by ID. */
		getById(teamId: number, options: TeamByIdOptions = {}) {
			return client.stats(statsPath(options.lang, "/team/id/{teamId}"), {
				...pickRequestOptions(options),
				pathParams: { teamId: parseTeamId(teamId) },
				schema: statsTeamInfoResponseSchema,
			});
		},

		/** Retrieve team stats for a specific Stats API report. */
		getStats(params: TeamStatsParams = {}) {
			return client.stats(statsPath(params.lang, "/team/{report}"), {
				...pickRequestOptions(params),
				pathParams: { report: params.report ?? "summary" },
				query: buildStatsQuery(params, {
					gameTypeId:
						params.gameType === undefined
							? undefined
							: parseGameType(params.gameType),
					seasonId:
						params.season === undefined
							? undefined
							: parseSeason(params.season),
					teamId:
						params.teamId === undefined
							? undefined
							: parseTeamId(params.teamId),
				}),
				schema: statsTeamStatsResponseSchema,
			});
		},

		/** Retrieve franchise information from the Stats API. */
		getFranchises(params: FranchiseParams = {}) {
			return client.stats(statsPath(params.lang, "/franchise"), {
				...pickRequestOptions(params),
				query: buildStatsQuery(params, {
					id: params.franchiseId,
				}),
				schema: statsFranchiseResponseSchema,
			});
		},
	};
}

function parseTeamAbbrev(teamAbbrev: string): string {
	return teamAbbrevSchema.parse(teamAbbrev);
}

function parseTeamId(teamId: number): number {
	return teamIdSchema.parse(teamId);
}

function parseSeason(season: number): number {
	return seasonIdSchema.parse(season);
}

function parseGameType(gameType: number): number {
	return gameTypeSchema.parse(gameType);
}

function getSchedulePath(params: TeamScheduleParams): string {
	if (params.month) {
		return "/club-schedule/{teamAbbrev}/month/{month}";
	}

	if (params.weekDate) {
		return "/club-schedule/{teamAbbrev}/week/{weekDate}";
	}

	if (params.season) {
		return "/club-schedule-season/{teamAbbrev}/{season}";
	}

	return "/club-schedule-season/{teamAbbrev}/now";
}

function buildClubStatsPathParams(
	teamAbbrev: string,
	params: ClubStatsParams,
): PathParams {
	const pathParams: PathParams = { teamAbbrev: parseTeamAbbrev(teamAbbrev) };

	if (params.season !== undefined && params.gameType !== undefined) {
		pathParams.season = parseSeason(params.season);
		pathParams.gameType = parseGameType(params.gameType);
	}

	return pathParams;
}

function buildRosterPathParams(
	teamAbbrev: string,
	params: TeamRosterParams,
): PathParams {
	const pathParams: PathParams = { teamAbbrev: parseTeamAbbrev(teamAbbrev) };

	if (params.season !== undefined) {
		pathParams.season = parseSeason(params.season);
	}

	return pathParams;
}

function buildSchedulePathParams(
	teamAbbrev: string,
	params: TeamScheduleParams,
): PathParams {
	const pathParams: PathParams = { teamAbbrev: parseTeamAbbrev(teamAbbrev) };

	if (params.month) {
		pathParams.month = params.month;
	}

	if (params.weekDate) {
		pathParams.weekDate = formatDate(params.weekDate);
	}

	if (params.season !== undefined) {
		pathParams.season = parseSeason(params.season);
	}

	return pathParams;
}

function formatDate(date: Date | string): string {
	if (date instanceof Date) {
		return date.toISOString().slice(0, 10);
	}

	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		throw new NhlApiError({
			code: "VALIDATION_ERROR",
			message: `Invalid NHL API date "${date}". Expected YYYY-MM-DD.`,
		});
	}

	return date;
}
