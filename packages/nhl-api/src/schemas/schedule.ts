import { z } from "zod";
import {
	gameIdSchema,
	gameTypeSchema,
	isoDateSchema,
	localeStringSchema,
	paginationSchema,
	seasonIdSchema,
	teamAbbrevSchema,
} from "./common.js";

const nullableNumberSchema = z.number().nullable().optional();
const nullableStringSchema = z.string().nullable().optional();

export const schedulePlayerSummarySchema = z
	.object({
		playerId: z.number().int().positive().optional(),
		firstInitial: localeStringSchema.or(z.string()).optional(),
		lastName: localeStringSchema.or(z.string()).optional(),
	})
	.passthrough();

export const scheduleTeamSummarySchema = z
	.object({
		id: z.number().int().positive().optional(),
		abbrev: teamAbbrevSchema.optional(),
		commonName: localeStringSchema.or(z.string()).optional(),
		placeName: localeStringSchema.or(z.string()).optional(),
		placeNameWithPreposition: localeStringSchema.or(z.string()).optional(),
		name: localeStringSchema.or(z.string()).optional(),
		logo: z.string().url().optional(),
		darkLogo: z.string().url().optional(),
		score: nullableNumberSchema,
		awaySplitSquad: z.boolean().optional(),
		homeSplitSquad: z.boolean().optional(),
		seasonId: seasonIdSchema.optional(),
		french: z.boolean().optional(),
	})
	.passthrough();

export const tvBroadcastSchema = z
	.object({
		id: z.number().int().positive().optional(),
		market: z.string().optional(),
		countryCode: z.string().optional(),
		network: z.string().optional(),
		sequenceNumber: z.number().int().optional(),
	})
	.passthrough();

const periodDescriptorSchema = z
	.object({
		number: z.number().int().positive().optional(),
		periodType: z.string().optional(),
		maxRegulationPeriods: z.number().int().positive().optional(),
	})
	.passthrough();

export const scheduleGameSummarySchema = z
	.object({
		id: gameIdSchema.optional(),
		gameId: gameIdSchema.optional(),
		season: seasonIdSchema.optional(),
		gameType: gameTypeSchema.optional(),
		gameTypeId: gameTypeSchema.optional(),
		venue: localeStringSchema.or(z.string()).optional(),
		neutralSite: z.boolean().optional(),
		startTimeUTC: z.string().optional(),
		easternUTCOffset: z.string().optional(),
		venueUTCOffset: z.string().optional(),
		venueTimezone: z.string().optional(),
		gameState: z.string().optional(),
		gameScheduleState: z.string().optional(),
		tvBroadcasts: z.array(tvBroadcastSchema).optional(),
		awayTeam: scheduleTeamSummarySchema.optional(),
		homeTeam: scheduleTeamSummarySchema.optional(),
		periodDescriptor: periodDescriptorSchema.optional(),
		gameOutcome: z.record(z.string(), z.unknown()).optional(),
		winningGoalie: schedulePlayerSummarySchema.optional(),
		winningGoalScorer: schedulePlayerSummarySchema.optional(),
		gameCenterLink: z.string().optional(),
	})
	.passthrough();

export const scheduleGameWeekSchema = z
	.object({
		date: isoDateSchema,
		dayAbbrev: z.string().optional(),
		numberOfGames: z.number().int().nonnegative().optional(),
		datePromo: z.array(z.unknown()).optional(),
		games: z.array(scheduleGameSummarySchema),
	})
	.passthrough();

export const leagueScheduleSchema = z
	.object({
		nextStartDate: isoDateSchema.optional(),
		previousStartDate: isoDateSchema.optional(),
		gameWeek: z.array(scheduleGameWeekSchema),
	})
	.passthrough();

export const scheduleCalendarSchema = z
	.object({
		startDate: isoDateSchema,
		endDate: isoDateSchema,
		nextStartDate: isoDateSchema.optional(),
		previousStartDate: isoDateSchema.optional(),
		teams: z.array(scheduleTeamSummarySchema),
	})
	.passthrough();

export const webSeasonsSchema = z.array(seasonIdSchema);

export const statsComponentSeasonSchema = z
	.object({
		id: z.number().int().positive().optional(),
		component: z.string().optional(),
		gameTypeId: gameTypeSchema.optional(),
		seasonId: seasonIdSchema.optional(),
	})
	.passthrough();

export const statsSeasonSchema = z
	.object({
		id: seasonIdSchema,
		formattedSeasonId: z.string().optional(),
		startDate: nullableStringSchema,
		regularSeasonEndDate: nullableStringSchema,
		endDate: nullableStringSchema,
		preseasonStartdate: nullableStringSchema,
		numberOfGames: nullableNumberSchema,
		totalRegularSeasonGames: nullableNumberSchema,
		totalPlayoffGames: nullableNumberSchema,
		seasonOrdinal: nullableNumberSchema,
	})
	.passthrough();

export const statsComponentSeasonsResponseSchema = z
	.object({
		data: z.array(statsComponentSeasonSchema),
		total: z.number().int().nonnegative().optional(),
	})
	.extend(paginationSchema.shape);

export const statsSeasonsResponseSchema = z
	.object({
		data: z.array(statsSeasonSchema),
		total: z.number().int().nonnegative().optional(),
	})
	.extend(paginationSchema.shape);

export type LeagueSchedule = z.infer<typeof leagueScheduleSchema>;
export type ScheduleCalendar = z.infer<typeof scheduleCalendarSchema>;
export type ScheduleGameSummary = z.infer<typeof scheduleGameSummarySchema>;
export type ScheduleGameWeek = z.infer<typeof scheduleGameWeekSchema>;
export type SchedulePlayerSummary = z.infer<typeof schedulePlayerSummarySchema>;
export type ScheduleTeamSummary = z.infer<typeof scheduleTeamSummarySchema>;
export type StatsComponentSeason = z.infer<typeof statsComponentSeasonSchema>;
export type StatsSeason = z.infer<typeof statsSeasonSchema>;
export type TvBroadcast = z.infer<typeof tvBroadcastSchema>;
export type WebSeasons = z.infer<typeof webSeasonsSchema>;
