import type { NhlApiClient } from "../client.js";
import { isoDateSchema } from "../schemas/common.js";
import {
	leagueScheduleSchema,
	scheduleCalendarSchema,
} from "../schemas/schedule.js";
import {
	type NhlApiDomainRequestOptions,
	pickLangQuery,
	pickRequestOptions,
} from "./common.js";

export type ScheduleRequestOptions = NhlApiDomainRequestOptions & {
	lang?: string;
};

export type ScheduleCalendarParams = ScheduleRequestOptions & {
	date?: string;
};

export type ScheduleDomain = ReturnType<typeof createScheduleDomain>;

export function createScheduleDomain(client: NhlApiClient) {
	return {
		/** Retrieve the current league schedule. */
		getLeagueSchedule(params: ScheduleRequestOptions = {}) {
			return client.web("/schedule/now", {
				...pickRequestOptions(params),
				query: pickLangQuery(params),
				schema: leagueScheduleSchema,
			});
		},

		/** Retrieve the league schedule for a specific date. */
		getByDate(date: string, options: ScheduleRequestOptions = {}) {
			return client.web("/schedule/{date}", {
				...pickRequestOptions(options),
				pathParams: { date: parseIsoDate(date) },
				query: pickLangQuery(options),
				schema: leagueScheduleSchema,
			});
		},

		/** Retrieve the schedule calendar as of now or for a specific date. */
		getCalendar(params: ScheduleCalendarParams = {}) {
			return client.web("/schedule-calendar/{date}", {
				...pickRequestOptions(params),
				pathParams: {
					date: params.date === undefined ? "now" : parseIsoDate(params.date),
				},
				query: pickLangQuery(params),
				schema: scheduleCalendarSchema,
			});
		},
	};
}

function parseIsoDate(date: string): string {
	return isoDateSchema.parse(date);
}
