import { NhlApiError } from "../errors.js";
import { cayenneAnd, cayenneEq, type QueryParams } from "../http.js";

export type NhlApiDomainRequestOptions = {
	headers?: HeadersInit;
	signal?: AbortSignal;
	timeoutMs?: number;
};

export type StatsApiLanguage = "en" | "fr" | (string & {});
export type StatsApiSortDirection = "asc" | "desc";

export type StatsApiListParams = NhlApiDomainRequestOptions & {
	cayenneExp?: string;
	dir?: StatsApiSortDirection;
	exclude?: string;
	include?: string;
	lang?: StatsApiLanguage;
	limit?: number;
	sort?: string;
	start?: number;
};

export function pickRequestOptions(
	options: NhlApiDomainRequestOptions,
): NhlApiDomainRequestOptions {
	return {
		headers: options.headers,
		signal: options.signal,
		timeoutMs: options.timeoutMs,
	};
}

export function pickLangQuery(options: { lang?: string }): QueryParams {
	return { lang: options.lang };
}

export function statsPath(
	lang: StatsApiLanguage | undefined,
	path: string,
): string {
	if (!lang || lang === "en") {
		return path;
	}

	const encodedLang = encodeStatsApiLanguage(lang);
	return `/../${encodedLang}${path}`;
}

export function buildStatsQuery(
	params: StatsApiListParams,
	filters: Record<string, string | number | boolean | undefined> = {},
): QueryParams {
	const expressions = Object.entries(filters)
		.filter((entry): entry is [string, string | number | boolean] => {
			return entry[1] !== undefined;
		})
		.map(([field, value]) => cayenneEq(field, value));
	const cayenneExp = cayenneAnd(...expressions, params.cayenneExp ?? "");

	return {
		cayenneExp: cayenneExp || undefined,
		dir: params.dir,
		exclude: params.exclude,
		include: params.include,
		limit: params.limit,
		sort: params.sort,
		start: params.start,
	};
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
