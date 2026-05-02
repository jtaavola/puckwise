import { z } from "zod";
import {
	gameIdSchema,
	localeStringSchema,
	paginationSchema,
	seasonIdSchema,
	statsApiResponseSchema,
	teamAbbrevSchema,
} from "./common.js";

const nullableNumberSchema = z.number().nullable().optional();
const nullableStringSchema = z.string().nullable().optional();

export const gameStateSchema = z.string().min(1);
export const gameScheduleStateSchema = z.string().min(1);
export const gameTypeIdSchema = z.number().int().positive();
export const gameDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const gameVenueSchema = z
	.object({
		default: z.string().optional(),
		fr: z.string().optional(),
		id: z.number().int().positive().optional(),
		name: localeStringSchema.or(z.string()).optional(),
	})
	.passthrough();

export const gameTeamSummarySchema = z
	.object({
		abbrev: teamAbbrevSchema.optional(),
		commonName: localeStringSchema.or(z.string()).optional(),
		darkLogo: z.string().url().optional(),
		id: z.number().int().positive().optional(),
		logo: z.string().url().optional(),
		name: localeStringSchema.or(z.string()).optional(),
		placeName: localeStringSchema.or(z.string()).optional(),
		score: z.number().int().nonnegative().optional(),
		sog: z.number().int().nonnegative().optional(),
	})
	.passthrough();

export const gameBroadcastSchema = z
	.object({
		countryCode: z.string().optional(),
		id: z.number().int().positive().optional(),
		market: z.string().optional(),
		name: z.string().optional(),
		network: z.string().optional(),
		sequenceNumber: z.number().int().optional(),
	})
	.passthrough();

export const gameClockSchema = z
	.object({
		inIntermission: z.boolean().optional(),
		running: z.boolean().optional(),
		secondsRemaining: z.number().int().nonnegative().optional(),
		timeRemaining: z.string().optional(),
	})
	.passthrough();

export const gamePeriodDescriptorSchema = z
	.object({
		maxRegulationPeriods: z.number().int().positive().optional(),
		number: z.number().int().nonnegative().optional(),
		periodType: z.string().optional(),
	})
	.passthrough();

export const gameGoalSchema = z
	.object({
		assists: z.array(z.record(z.string(), z.unknown())).optional(),
		highlightClip: z.number().int().nullable().optional(),
		name: localeStringSchema.or(z.string()).optional(),
		period: z.number().int().positive().optional(),
		playerId: z.number().int().positive().optional(),
		strength: z.string().optional(),
		teamAbbrev: teamAbbrevSchema.optional(),
		timeInPeriod: z.string().optional(),
	})
	.passthrough();

export const gameSummarySchema = z
	.object({
		awayTeam: gameTeamSummarySchema.optional(),
		clock: gameClockSchema.optional(),
		gameCenterLink: z.string().optional(),
		gameDate: gameDateSchema.optional(),
		gameId: gameIdSchema.optional(),
		gameScheduleState: gameScheduleStateSchema.optional(),
		gameState: gameStateSchema.optional(),
		gameType: gameTypeIdSchema.optional(),
		homeTeam: gameTeamSummarySchema.optional(),
		id: gameIdSchema.optional(),
		periodDescriptor: gamePeriodDescriptorSchema.optional(),
		season: seasonIdSchema.optional(),
		startTimeUTC: z.string().optional(),
		tvBroadcasts: z.array(gameBroadcastSchema).optional(),
		venue: gameVenueSchema.optional(),
	})
	.passthrough();

export const scoresResponseSchema = z
	.object({
		currentDate: gameDateSchema.optional(),
		games: z.array(gameSummarySchema),
		nextDate: gameDateSchema.optional(),
		prevDate: gameDateSchema.optional(),
	})
	.passthrough();

export const scoreboardResponseSchema = z
	.object({
		focusedDate: gameDateSchema.optional(),
		gamesByDate: z
			.array(
				z
					.object({
						date: gameDateSchema.optional(),
						games: z.array(gameSummarySchema).optional(),
					})
					.passthrough(),
			)
			.optional(),
		games: z.array(gameSummarySchema).optional(),
	})
	.passthrough();

export const gameBoxscorePlayerSchema = z
	.object({
		assists: nullableNumberSchema,
		firstName: localeStringSchema.or(z.string()).optional(),
		goals: nullableNumberSchema,
		lastName: localeStringSchema.or(z.string()).optional(),
		name: localeStringSchema.or(z.string()).optional(),
		playerId: z.number().int().positive().optional(),
		position: z.string().optional(),
		positionCode: z.string().optional(),
		saves: nullableNumberSchema,
		shots: nullableNumberSchema,
		sweaterNumber: z.number().int().positive().nullable().optional(),
	})
	.passthrough();

export const gameBoxscoreTeamSchema = gameTeamSummarySchema
	.extend({
		forwards: z.array(gameBoxscorePlayerSchema).optional(),
		defensemen: z.array(gameBoxscorePlayerSchema).optional(),
		goalies: z.array(gameBoxscorePlayerSchema).optional(),
		skaters: z.array(gameBoxscorePlayerSchema).optional(),
	})
	.passthrough();

export const gameBoxscoreSchema = z
	.object({
		awayTeam: gameBoxscoreTeamSchema,
		gameDate: gameDateSchema.optional(),
		gameId: gameIdSchema.optional(),
		gameState: gameStateSchema.optional(),
		homeTeam: gameBoxscoreTeamSchema,
		id: gameIdSchema.optional(),
		playerByGameStats: z.record(z.string(), z.unknown()).optional(),
		season: seasonIdSchema.optional(),
	})
	.passthrough();

export const gameLandingSchema = gameBoxscoreSchema
	.extend({
		summary: z
			.object({
				gameInfo: z.record(z.string(), z.unknown()).optional(),
				scoring: z.array(z.record(z.string(), z.unknown())).optional(),
				teamGameStats: z.array(z.record(z.string(), z.unknown())).optional(),
			})
			.passthrough()
			.optional(),
	})
	.passthrough();

export const gamePlayByPlayEventSchema = z
	.object({
		details: z.record(z.string(), z.unknown()).optional(),
		eventId: z.number().int().optional(),
		periodDescriptor: gamePeriodDescriptorSchema.optional(),
		situationCode: nullableStringSchema,
		sortOrder: z.number().int().optional(),
		timeInPeriod: z.string().optional(),
		typeCode: z.number().int().optional(),
		typeDescKey: z.string().optional(),
	})
	.passthrough();

export const gamePlayByPlaySchema = gameSummarySchema
	.extend({
		plays: z.array(gamePlayByPlayEventSchema),
		rosterSpots: z.array(z.record(z.string(), z.unknown())).optional(),
	})
	.passthrough();

export const gameStorySchema = z
	.object({
		gameId: gameIdSchema.optional(),
		items: z.array(z.record(z.string(), z.unknown())).optional(),
		modules: z.array(z.record(z.string(), z.unknown())).optional(),
		story: z.record(z.string(), z.unknown()).optional(),
	})
	.passthrough();

export const statsGameInfoSchema = z
	.object({
		awayTeamId: nullableNumberSchema,
		gameDate: nullableStringSchema,
		gameId: gameIdSchema.optional(),
		gameStateId: nullableNumberSchema,
		gameType: gameTypeIdSchema.optional(),
		gameTypeId: gameTypeIdSchema.optional(),
		id: gameIdSchema.optional(),
		homeTeamId: nullableNumberSchema,
		season: seasonIdSchema.optional(),
		seasonId: seasonIdSchema.optional(),
	})
	.passthrough();

export const statsGameInfoResponseSchema = statsApiResponseSchema(
	statsGameInfoSchema,
).extend(paginationSchema.shape);

export const statsGameMetadataResponseSchema = z
	.object({
		data: z.array(z.record(z.string(), z.unknown())).optional(),
	})
	.passthrough();

export const statsShiftChartSchema = z
	.object({
		duration: nullableStringSchema,
		endTime: nullableStringSchema,
		eventDescription: nullableStringSchema,
		gameId: gameIdSchema.optional(),
		period: z.number().int().positive().optional(),
		playerId: z.number().int().positive().optional(),
		startTime: nullableStringSchema,
		teamAbbrev: teamAbbrevSchema.optional(),
	})
	.passthrough();

export const statsShiftChartsResponseSchema = statsApiResponseSchema(
	statsShiftChartSchema,
).extend(paginationSchema.shape);

export const streamsResponseSchema = z.record(z.string(), z.unknown());
export const tvScheduleResponseSchema = z.record(z.string(), z.unknown());
export const oddsResponseSchema = z.record(z.string(), z.unknown());
export const replayResponseSchema = z.record(z.string(), z.unknown());
export const wscPlayByPlayResponseSchema = z.record(z.string(), z.unknown());

export type GameBroadcast = z.infer<typeof gameBroadcastSchema>;
export type GameBoxscore = z.infer<typeof gameBoxscoreSchema>;
export type GameBoxscorePlayer = z.infer<typeof gameBoxscorePlayerSchema>;
export type GameBoxscoreTeam = z.infer<typeof gameBoxscoreTeamSchema>;
export type GameClock = z.infer<typeof gameClockSchema>;
export type GameGoal = z.infer<typeof gameGoalSchema>;
export type GameLanding = z.infer<typeof gameLandingSchema>;
export type GamePeriodDescriptor = z.infer<typeof gamePeriodDescriptorSchema>;
export type GamePlayByPlay = z.infer<typeof gamePlayByPlaySchema>;
export type GamePlayByPlayEvent = z.infer<typeof gamePlayByPlayEventSchema>;
export type GameState = z.infer<typeof gameStateSchema>;
export type GameStory = z.infer<typeof gameStorySchema>;
export type GameSummary = z.infer<typeof gameSummarySchema>;
export type GameTeamSummary = z.infer<typeof gameTeamSummarySchema>;
export type GameVenue = z.infer<typeof gameVenueSchema>;
export type OddsResponse = z.infer<typeof oddsResponseSchema>;
export type ReplayResponse = z.infer<typeof replayResponseSchema>;
export type ScoresResponse = z.infer<typeof scoresResponseSchema>;
export type ScoreboardResponse = z.infer<typeof scoreboardResponseSchema>;
export type StatsGameInfo = z.infer<typeof statsGameInfoSchema>;
export type StatsShiftChart = z.infer<typeof statsShiftChartSchema>;
export type StreamsResponse = z.infer<typeof streamsResponseSchema>;
export type TvScheduleResponse = z.infer<typeof tvScheduleResponseSchema>;
export type WscPlayByPlayResponse = z.infer<typeof wscPlayByPlayResponseSchema>;
