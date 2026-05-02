import { z } from "zod";
import { NhlApiError } from "../errors.js";

export const localeStringSchema = z
	.object({
		default: z.string(),
		fr: z.string().optional(),
	})
	.passthrough();

export const seasonIdSchema = z
	.number()
	.int()
	.min(1_917_191_8)
	.refine((season) => {
		const startYear = Math.floor(season / 10_000);
		const endYear = season % 10_000;
		return endYear === startYear + 1;
	}, "Season IDs must use the YYYYYYYY format with consecutive years");

export const isoDateSchema = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, "Expected an ISO date string (YYYY-MM-DD)")
	.refine((date) => {
		const parsed = new Date(`${date}T00:00:00.000Z`);
		return (
			!Number.isNaN(parsed.getTime()) &&
			parsed.toISOString().slice(0, 10) === date
		);
	}, "Expected a valid ISO date string");

export const teamAbbrevSchema = z.string().min(2).max(3).toUpperCase();
export const gameIdSchema = z.number().int().positive();
export const gameTypeSchema = z.number().int().positive();

export const paginationSchema = z
	.object({
		total: z.number().int().nonnegative().optional(),
		limit: z.number().int().positive().optional(),
		start: z.number().int().nonnegative().optional(),
	})
	.passthrough();

export function statsApiResponseSchema<T extends z.ZodType>(
	itemSchema: T,
): z.ZodObject<{
	data: z.ZodArray<T>;
	total: z.ZodOptional<z.ZodNumber>;
}> {
	return z.object({
		data: z.array(itemSchema),
		total: z.number().int().nonnegative().optional(),
	});
}

export function parseNhlApiResponse<TSchema extends z.ZodType>(
	schema: TSchema,
	data: unknown,
	context: { method?: string; url?: string } = {},
): z.infer<TSchema> {
	const result = schema.safeParse(data);

	if (!result.success) {
		throw new NhlApiError({
			code: "VALIDATION_ERROR",
			message: "NHL API response did not match the expected schema",
			issues: result.error.issues,
			method: context.method,
			url: context.url,
		});
	}

	return result.data;
}

export type LocaleString = z.infer<typeof localeStringSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
