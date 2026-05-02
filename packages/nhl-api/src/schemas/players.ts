import { z } from "zod";
import {
	gameIdSchema,
	gameTypeSchema,
	localeStringSchema,
	paginationSchema,
	seasonIdSchema,
	teamAbbrevSchema,
} from "./common.js";

const nullableStringSchema = z.string().nullable().optional();
const nullableNumberSchema = z.number().nullable().optional();

export const playerIdSchema = z.number().int().positive();
export const playerPositionCodeSchema = z.enum(["C", "L", "R", "D", "G"]);
export const playerHandednessSchema = z.enum(["L", "R"]).or(z.string().min(1));

export const playerIdentitySchema = z
	.object({
		playerId: playerIdSchema.optional(),
		id: playerIdSchema.optional(),
		firstName: localeStringSchema.or(z.string()).optional(),
		lastName: localeStringSchema.or(z.string()).optional(),
		name: localeStringSchema.or(z.string()).optional(),
		fullName: z.string().optional(),
		sweaterNumber: z.number().int().positive().nullable().optional(),
		positionCode: playerPositionCodeSchema.or(z.string()).optional(),
		headshot: z.string().url().optional(),
		heroImage: z.string().url().optional(),
		shootsCatches: playerHandednessSchema.optional(),
	})
	.passthrough();

export const playerTeamSchema = z
	.object({
		id: z.number().int().positive().optional(),
		teamId: z.number().int().positive().optional(),
		abbrev: teamAbbrevSchema.optional(),
		triCode: teamAbbrevSchema.optional(),
		name: localeStringSchema.or(z.string()).optional(),
		placeName: localeStringSchema.or(z.string()).optional(),
		logo: z.string().url().optional(),
		darkLogo: z.string().url().optional(),
	})
	.passthrough();

export const skaterSeasonTotalSchema = z
	.object({
		assists: nullableNumberSchema,
		gameTypeId: gameTypeSchema.optional(),
		gamesPlayed: nullableNumberSchema,
		goals: nullableNumberSchema,
		leagueAbbrev: z.string().optional(),
		pim: nullableNumberSchema,
		plusMinus: nullableNumberSchema,
		points: nullableNumberSchema,
		season: seasonIdSchema.optional(),
		sequence: z.number().int().optional(),
		shootingPctg: nullableNumberSchema,
		teamName: localeStringSchema.or(z.string()).optional(),
	})
	.passthrough();

export const goalieSeasonTotalSchema = z
	.object({
		gameTypeId: gameTypeSchema.optional(),
		gamesPlayed: nullableNumberSchema,
		gaa: nullableNumberSchema,
		leagueAbbrev: z.string().optional(),
		losses: nullableNumberSchema,
		savePctg: nullableNumberSchema,
		season: seasonIdSchema.optional(),
		sequence: z.number().int().optional(),
		shutouts: nullableNumberSchema,
		teamName: localeStringSchema.or(z.string()).optional(),
		ties: nullableNumberSchema,
		wins: nullableNumberSchema,
	})
	.passthrough();

export const playerLandingSchema = playerIdentitySchema
	.extend({
		birthCity: localeStringSchema.or(z.string()).optional(),
		birthCountry: z.string().optional(),
		birthDate: z.string().optional(),
		birthStateProvince: localeStringSchema.or(z.string()).optional(),
		careerTotals: z.record(z.string(), z.unknown()).optional(),
		currentTeamAbbrev: teamAbbrevSchema.optional(),
		currentTeamId: z.number().int().positive().optional(),
		currentTeamRoster: z.array(playerIdentitySchema).optional(),
		draftDetails: z.record(z.string(), z.unknown()).optional(),
		featuredStats: z.record(z.string(), z.unknown()).optional(),
		fullTeamName: localeStringSchema.or(z.string()).optional(),
		heightInCentimeters: nullableNumberSchema,
		heightInInches: nullableNumberSchema,
		position: playerPositionCodeSchema.or(z.string()).optional(),
		seasonTotals: z
			.array(skaterSeasonTotalSchema.or(goalieSeasonTotalSchema))
			.optional(),
		shopLink: z.string().optional(),
		teamCommonName: localeStringSchema.or(z.string()).optional(),
		teamLogo: z.string().url().optional(),
		teamPlaceNameWithPreposition: localeStringSchema.or(z.string()).optional(),
		weightInKilograms: nullableNumberSchema,
		weightInPounds: nullableNumberSchema,
	})
	.passthrough()
	.transform((player) => ({
		...player,
		positionCode: player.positionCode ?? player.position,
	}));

export const playerGameLogGameSchema = z
	.object({
		assists: nullableNumberSchema,
		gameDate: z.string().optional(),
		gameId: gameIdSchema.optional(),
		gameTypeId: gameTypeSchema.optional(),
		goals: nullableNumberSchema,
		homeRoadFlag: z.string().optional(),
		opponentAbbrev: teamAbbrevSchema.optional(),
		pim: nullableNumberSchema,
		plusMinus: nullableNumberSchema,
		points: nullableNumberSchema,
		season: seasonIdSchema.optional(),
		shifts: nullableNumberSchema,
		shots: nullableNumberSchema,
		teamAbbrev: teamAbbrevSchema.optional(),
		toi: z.string().optional(),
	})
	.passthrough();

export const playerGameLogSchema = z
	.object({
		gameLog: z.array(playerGameLogGameSchema),
		seasonId: seasonIdSchema.optional(),
		gameTypeId: gameTypeSchema.optional(),
	})
	.passthrough();

export const playerSpotlightItemSchema = playerIdentitySchema
	.extend({
		team: playerTeamSchema.optional(),
		teamAbbrev: teamAbbrevSchema.optional(),
		teamId: z.number().int().positive().optional(),
	})
	.passthrough();

export const playerSpotlightSchema = z
	.object({
		players: z.array(playerSpotlightItemSchema),
	})
	.passthrough();

export const statsPlayerInfoSchema = z
	.object({
		birthCity: nullableStringSchema,
		birthCountryCode: nullableStringSchema,
		birthDate: nullableStringSchema,
		birthStateProvinceCode: nullableStringSchema,
		currentTeamAbbrev: nullableStringSchema,
		currentTeamId: nullableNumberSchema,
		firstName: z.string().optional(),
		fullName: z.string().optional(),
		id: playerIdSchema.optional(),
		isActive: z.boolean().optional(),
		lastName: z.string().optional(),
		playerId: playerIdSchema.optional(),
		positionCode: playerPositionCodeSchema.or(z.string()).optional(),
		shootsCatches: nullableStringSchema,
	})
	.passthrough()
	.refine(
		(player) => player.playerId !== undefined || player.id !== undefined,
		{
			message: "Stats player info must include playerId or id",
			path: ["playerId"],
		},
	)
	.transform((player) => ({
		...player,
		playerId: player.playerId ?? player.id,
	}));

export const statsSkaterStatSchema = z
	.object({
		assists: nullableNumberSchema,
		evGoals: nullableNumberSchema,
		evPoints: nullableNumberSchema,
		gameTypeId: gameTypeSchema.optional(),
		gamesPlayed: nullableNumberSchema,
		goals: nullableNumberSchema,
		lastName: z.string().optional(),
		playerId: playerIdSchema.optional(),
		playerName: z.string().optional(),
		points: nullableNumberSchema,
		positionCode: playerPositionCodeSchema.or(z.string()).optional(),
		ppGoals: nullableNumberSchema,
		ppPoints: nullableNumberSchema,
		seasonId: seasonIdSchema.optional(),
		shootingPct: nullableNumberSchema,
		shots: nullableNumberSchema,
		teamAbbrevs: z.string().optional(),
		teamId: nullableNumberSchema,
		timeOnIcePerGame: nullableNumberSchema,
	})
	.passthrough();

export const statsGoalieStatSchema = z
	.object({
		gameTypeId: gameTypeSchema.optional(),
		gamesPlayed: nullableNumberSchema,
		gaa: nullableNumberSchema,
		goalsAgainst: nullableNumberSchema,
		lastName: z.string().optional(),
		losses: nullableNumberSchema,
		otLosses: nullableNumberSchema,
		playerId: playerIdSchema.optional(),
		playerName: z.string().optional(),
		savePct: nullableNumberSchema,
		seasonId: seasonIdSchema.optional(),
		shotsAgainst: nullableNumberSchema,
		shutouts: nullableNumberSchema,
		teamAbbrevs: z.string().optional(),
		teamId: nullableNumberSchema,
		wins: nullableNumberSchema,
	})
	.passthrough();

export const statsLeaderSchema = z
	.object({
		firstName: z.string().optional(),
		lastName: z.string().optional(),
		playerId: playerIdSchema.optional(),
		playerName: z.string().optional(),
		positionCode: playerPositionCodeSchema.or(z.string()).optional(),
		rank: z.number().int().positive().optional(),
		teamAbbrev: teamAbbrevSchema.optional(),
		teamId: z.number().int().positive().optional(),
		value: z.number().optional(),
	})
	.passthrough();

export const statsMilestoneSchema = z
	.object({
		achievementDate: z.string().nullable().optional(),
		firstName: z.string().optional(),
		lastName: z.string().optional(),
		milestone: z.string().optional(),
		milestoneAmount: nullableNumberSchema,
		playerId: playerIdSchema.optional(),
		teamAbbrev: teamAbbrevSchema.optional(),
	})
	.passthrough();

export const statsPlayerInfoResponseSchema = z
	.object({
		data: z.array(statsPlayerInfoSchema),
		total: z.number().int().nonnegative().optional(),
	})
	.extend(paginationSchema.shape);

export const statsSkaterStatsResponseSchema = z
	.object({
		data: z.array(statsSkaterStatSchema),
		total: z.number().int().nonnegative().optional(),
	})
	.extend(paginationSchema.shape);

export const statsGoalieStatsResponseSchema = z
	.object({
		data: z.array(statsGoalieStatSchema),
		total: z.number().int().nonnegative().optional(),
	})
	.extend(paginationSchema.shape);

export const statsLeadersResponseSchema = z
	.object({
		data: z.array(statsLeaderSchema),
		total: z.number().int().nonnegative().optional(),
	})
	.extend(paginationSchema.shape);

export const statsMilestonesResponseSchema = z
	.object({
		data: z.array(statsMilestoneSchema),
		total: z.number().int().nonnegative().optional(),
	})
	.extend(paginationSchema.shape);

export type GameType = z.infer<typeof gameTypeSchema>;
export type PlayerGameLog = z.infer<typeof playerGameLogSchema>;
export type PlayerGameLogGame = z.infer<typeof playerGameLogGameSchema>;
export type PlayerIdentity = z.infer<typeof playerIdentitySchema>;
export type PlayerLanding = z.infer<typeof playerLandingSchema>;
export type PlayerSpotlight = z.infer<typeof playerSpotlightSchema>;
export type PlayerSpotlightItem = z.infer<typeof playerSpotlightItemSchema>;
export type PlayerTeam = z.infer<typeof playerTeamSchema>;
export type StatsGoalieStat = z.infer<typeof statsGoalieStatSchema>;
export type StatsLeader = z.infer<typeof statsLeaderSchema>;
export type StatsMilestone = z.infer<typeof statsMilestoneSchema>;
export type StatsPlayerInfo = z.infer<typeof statsPlayerInfoSchema>;
export type StatsSkaterStat = z.infer<typeof statsSkaterStatSchema>;
