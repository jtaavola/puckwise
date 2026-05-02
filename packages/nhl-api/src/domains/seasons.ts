import type { NhlApiClient } from "../client.js";
import { gameTypeSchema, seasonIdSchema } from "../schemas/common.js";
import {
	statsComponentSeasonsResponseSchema,
	statsSeasonsResponseSchema,
	webSeasonsSchema,
} from "../schemas/schedule.js";
import {
	buildStatsQuery,
	type NhlApiDomainRequestOptions,
	pickRequestOptions,
	type StatsApiListParams,
	statsPath,
} from "./common.js";

export type WebSeasonsParams = NhlApiDomainRequestOptions;

export type ComponentSeasonsParams = StatsApiListParams & {
	component?: string;
	gameType?: number;
	id?: number;
	season?: number;
};

export type StatsSeasonsParams = StatsApiListParams & {
	id?: number;
	rowInUse?: number | boolean;
	season?: number;
};

export type SeasonsDomain = ReturnType<typeof createSeasonsDomain>;

export function createSeasonsDomain(client: NhlApiClient) {
	return {
		/** Retrieve a list of all NHL season IDs, past and present. */
		getWebSeasons(params: WebSeasonsParams = {}) {
			return client.web("/season", {
				...pickRequestOptions(params),
				schema: webSeasonsSchema,
			});
		},

		/** Retrieve component season information from the Stats API. */
		getComponentSeasons(params: ComponentSeasonsParams = {}) {
			return client.stats(statsPath(params.lang, "/componentSeason"), {
				...pickRequestOptions(params),
				query: buildStatsQuery(params, {
					component: params.component,
					gameTypeId:
						params.gameType === undefined
							? undefined
							: gameTypeSchema.parse(params.gameType),
					id: params.id,
					seasonId:
						params.season === undefined
							? undefined
							: seasonIdSchema.parse(params.season),
				}),
				schema: statsComponentSeasonsResponseSchema,
			});
		},

		/** Retrieve season information from the Stats API. */
		getStatsSeasons(params: StatsSeasonsParams = {}) {
			return client.stats(statsPath(params.lang, "/season"), {
				...pickRequestOptions(params),
				query: buildStatsQuery(params, {
					id: params.id ?? parseOptionalSeason(params.season),
					rowInUse: params.rowInUse,
				}),
				schema: statsSeasonsResponseSchema,
			});
		},
	};
}

function parseOptionalSeason(season: number | undefined): number | undefined {
	return season === undefined ? undefined : seasonIdSchema.parse(season);
}
