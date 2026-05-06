import type { z } from "zod";
import { createPlayersDomain, type PlayersDomain } from "./domains/players.js";
import {
	buildUrl,
	DEFAULT_TIMEOUT_MS,
	getDefaultBaseUrls,
	type NhlApiBaseUrls,
	type NhlApiHost,
	type NhlFetch,
	type PathParams,
	type QueryParams,
	requestJson,
} from "./http.js";
import { parseNhlApiResponse } from "./schemas/common.js";

export type NhlApiClientOptions = {
	fetch?: NhlFetch;
	baseUrls?: NhlApiBaseUrls;
	headers?: HeadersInit;
	timeoutMs?: number;
};

export type NhlApiRequestOptions<TSchema extends z.ZodType> = {
	host: NhlApiHost;
	path: string;
	schema: TSchema;
	pathParams?: PathParams;
	query?: QueryParams;
	headers?: HeadersInit;
	method?: string;
	body?: BodyInit;
	signal?: AbortSignal;
	timeoutMs?: number;
};

export class NhlApiClient {
	readonly baseUrls: Record<NhlApiHost, string>;
	readonly defaultHeaders: HeadersInit;
	readonly players: PlayersDomain;
	readonly timeoutMs: number;

	readonly #fetch: NhlFetch;

	constructor(options: NhlApiClientOptions = {}) {
		this.#fetch = options.fetch ?? fetch;
		this.baseUrls = {
			...getDefaultBaseUrls(),
			...options.baseUrls,
		};
		this.defaultHeaders = options.headers ?? {};
		this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
		this.players = createPlayersDomain(this);
	}

	async request<TSchema extends z.ZodType>(
		options: NhlApiRequestOptions<TSchema>,
	): Promise<z.infer<TSchema>> {
		const method = options.method ?? "GET";
		const url = buildUrl({
			baseUrl: this.baseUrls[options.host],
			path: options.path,
			pathParams: options.pathParams,
			query: options.query,
		});
		const json = await requestJson({
			body: options.body,
			fetch: this.#fetch,
			headers: mergeHeaders(this.defaultHeaders, options.headers),
			method,
			signal: options.signal,
			timeoutMs: options.timeoutMs ?? this.timeoutMs,
			url,
		});

		return parseNhlApiResponse(options.schema, json, {
			method,
			url: url.toString(),
		});
	}

	web<TSchema extends z.ZodType>(
		path: string,
		options: Omit<NhlApiRequestOptions<TSchema>, "host" | "path">,
	): Promise<z.infer<TSchema>> {
		return this.request({ ...options, host: "web", path });
	}

	stats<TSchema extends z.ZodType>(
		path: string,
		options: Omit<NhlApiRequestOptions<TSchema>, "host" | "path">,
	): Promise<z.infer<TSchema>> {
		return this.request({ ...options, host: "stats", path });
	}

	edge<TSchema extends z.ZodType>(
		path: string,
		options: Omit<NhlApiRequestOptions<TSchema>, "host" | "path">,
	): Promise<z.infer<TSchema>> {
		return this.request({ ...options, host: "edge", path });
	}
}

export function createNhlApiClient(
	options: NhlApiClientOptions = {},
): NhlApiClient {
	return new NhlApiClient(options);
}

function mergeHeaders(
	defaultHeaders: HeadersInit,
	headers?: HeadersInit,
): Headers {
	const merged = new Headers(defaultHeaders);

	if (headers) {
		for (const [key, value] of new Headers(headers).entries()) {
			merged.set(key, value);
		}
	}

	return merged;
}
