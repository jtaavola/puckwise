import type { z } from "zod";

export type NhlApiErrorCode =
	| "HTTP_ERROR"
	| "INVALID_JSON"
	| "TIMEOUT"
	| "ABORTED"
	| "VALIDATION_ERROR"
	| "NETWORK_ERROR";

export type NhlApiErrorOptions = {
	code: NhlApiErrorCode;
	message: string;
	url?: string;
	method?: string;
	status?: number;
	statusText?: string;
	responseBody?: string;
	timeoutMs?: number;
	issues?: z.core.$ZodIssue[];
	cause?: unknown;
};

export class NhlApiError extends Error {
	readonly code: NhlApiErrorCode;
	readonly url?: string;
	readonly method?: string;
	readonly status?: number;
	readonly statusText?: string;
	readonly responseBody?: string;
	readonly timeoutMs?: number;
	readonly issues?: z.core.$ZodIssue[];

	constructor(options: NhlApiErrorOptions) {
		super(options.message, { cause: options.cause });
		this.name = "NhlApiError";
		this.code = options.code;
		this.url = options.url;
		this.method = options.method;
		this.status = options.status;
		this.statusText = options.statusText;
		this.responseBody = options.responseBody;
		this.timeoutMs = options.timeoutMs;
		this.issues = options.issues;
	}
}

export function isNhlApiError(error: unknown): error is NhlApiError {
	return error instanceof NhlApiError;
}
