import { NhlApiError } from "./errors.js";

export const DEFAULT_NHL_WEB_API_BASE_URL = "https://api-web.nhle.com/v1";
export const DEFAULT_NHL_STATS_API_BASE_URL =
	"https://api.nhle.com/stats/rest/en";
export const DEFAULT_NHL_EDGE_API_BASE_URL = `${DEFAULT_NHL_WEB_API_BASE_URL}/edge`;
export const DEFAULT_TIMEOUT_MS = 10_000;

export type NhlApiHost = "web" | "stats" | "edge";

export type NhlApiBaseUrls = Partial<Record<NhlApiHost, string>>;

export type QueryPrimitive = string | number | boolean | Date;
export type QueryValue =
	| QueryPrimitive
	| readonly QueryPrimitive[]
	| null
	| undefined;
export type QueryParams = Record<string, QueryValue>;
export type PathParams = Record<string, string | number | boolean>;

export type NhlFetch = (
	input: RequestInfo | URL,
	init?: RequestInit,
) => Promise<Response>;

export type RequestJsonOptions = {
	fetch: NhlFetch;
	url: URL;
	method?: string;
	headers?: HeadersInit;
	body?: BodyInit;
	timeoutMs: number;
	signal?: AbortSignal;
};

export function getDefaultBaseUrls(): Record<NhlApiHost, string> {
	return {
		web: DEFAULT_NHL_WEB_API_BASE_URL,
		stats: DEFAULT_NHL_STATS_API_BASE_URL,
		edge: DEFAULT_NHL_EDGE_API_BASE_URL,
	};
}

export function buildUrl(options: {
	baseUrl: string;
	path: string;
	pathParams?: PathParams;
	query?: QueryParams;
}): URL {
	const interpolatedPath = interpolatePath(options.path, options.pathParams);
	const baseUrl = options.baseUrl.endsWith("/")
		? options.baseUrl
		: `${options.baseUrl}/`;
	const url = new URL(interpolatedPath.replace(/^\/+/, ""), baseUrl);
	const query = serializeQuery(options.query);

	if (query) {
		url.search = query;
	}

	return url;
}

export function interpolatePath(path: string, params: PathParams = {}): string {
	return path.replaceAll(
		/\{([A-Za-z0-9_]+)\}|:([A-Za-z0-9_]+)/g,
		(_match, braced, named) => {
			const key = braced ?? named;
			const value = params[key];

			if (value === undefined) {
				throw new NhlApiError({
					code: "VALIDATION_ERROR",
					message: `Missing path parameter "${key}" for path "${path}"`,
				});
			}

			return encodeURIComponent(String(value));
		},
	);
}

export function serializeQuery(query: QueryParams = {}): string {
	const searchParams = new URLSearchParams();

	for (const [key, value] of Object.entries(query)) {
		if (value === undefined || value === null) {
			continue;
		}

		const values = Array.isArray(value) ? value : [value];
		for (const item of values) {
			searchParams.append(key, serializeQueryPrimitive(item));
		}
	}

	return searchParams.toString();
}

export function cayenneString(value: string): string {
	return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

export function cayenneEq(
	field: string,
	value: string | number | boolean,
): string {
	const serializedValue =
		typeof value === "string" ? cayenneString(value) : String(value);
	return `${field}=${serializedValue}`;
}

export function cayenneAnd(...expressions: readonly string[]): string {
	return expressions.filter(Boolean).join(" and ");
}

export async function requestJson(
	options: RequestJsonOptions,
): Promise<unknown> {
	const method = options.method ?? "GET";
	const timeoutController = new AbortController();
	const timeoutId = setTimeout(
		() => timeoutController.abort(),
		options.timeoutMs,
	);
	const signal = combineSignals(timeoutController.signal, options.signal);

	try {
		const response = await options.fetch(options.url, {
			body: options.body,
			headers: options.headers,
			method,
			signal,
		});
		const responseText = await response.text();

		if (!response.ok) {
			throw new NhlApiError({
				code: "HTTP_ERROR",
				message: `NHL API request failed with ${response.status} ${response.statusText}`,
				method,
				responseBody: responseText,
				status: response.status,
				statusText: response.statusText,
				url: options.url.toString(),
			});
		}

		if (!responseText) {
			return null;
		}

		try {
			return JSON.parse(responseText) as unknown;
		} catch (error) {
			throw new NhlApiError({
				code: "INVALID_JSON",
				message: "NHL API response was not valid JSON",
				cause: error,
				method,
				responseBody: responseText,
				url: options.url.toString(),
			});
		}
	} catch (error) {
		if (error instanceof NhlApiError) {
			throw error;
		}

		const isTimeout = timeoutController.signal.aborted;
		const code = isTimeout
			? "TIMEOUT"
			: isAbortError(error)
				? "ABORTED"
				: "NETWORK_ERROR";
		throw new NhlApiError({
			code,
			message: getRequestErrorMessage(code),
			cause: error,
			method,
			timeoutMs: isTimeout ? options.timeoutMs : undefined,
			url: options.url.toString(),
		});
	} finally {
		clearTimeout(timeoutId);
	}
}

function serializeQueryPrimitive(value: QueryPrimitive): string {
	if (value instanceof Date) {
		return value.toISOString().slice(0, 10);
	}

	return String(value);
}

function combineSignals(
	timeoutSignal: AbortSignal,
	userSignal?: AbortSignal,
): AbortSignal {
	if (!userSignal) {
		return timeoutSignal;
	}

	const controller = new AbortController();
	const abort = () => controller.abort();

	if (timeoutSignal.aborted || userSignal.aborted) {
		abort();
		return controller.signal;
	}

	timeoutSignal.addEventListener("abort", abort, { once: true });
	userSignal.addEventListener("abort", abort, { once: true });
	return controller.signal;
}

function isAbortError(error: unknown): boolean {
	return error instanceof DOMException && error.name === "AbortError";
}

function getRequestErrorMessage(
	code: "TIMEOUT" | "ABORTED" | "NETWORK_ERROR",
): string {
	if (code === "TIMEOUT") {
		return "NHL API request timed out";
	}

	if (code === "ABORTED") {
		return "NHL API request was aborted";
	}

	return "NHL API request failed";
}
