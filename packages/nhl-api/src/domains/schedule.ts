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
		getLeagueSchedule(params: ScheduleRequestOptions = {}) {
			return client.web("/schedule/now", {
				...pickRequestOptions(params),
				query: pickLangQuery(params),
				schema: leagueScheduleSchema,
			});
		},

		getByDate(date: string, options: ScheduleRequestOptions = {}) {
			return client.web("/schedule/{date}", {
				...pickRequestOptions(options),
				pathParams: { date: parseIsoDate(date) },
				query: pickLangQuery(options),
				schema: leagueScheduleSchema,
			});
		},

		getCalendar(params: ScheduleCalendarParams = {}) {
			return client.web("/schedule-calendar/{date}", {
				...pickRequestOptions(params),
				pathParams: { date: params.date ? parseIsoDate(params.date) : "now" },
				query: pickLangQuery(params),
				schema: scheduleCalendarSchema,
			});
		},
	};
}

function parseIsoDate(date: string): string {
	return isoDateSchema.parse(date);
}
