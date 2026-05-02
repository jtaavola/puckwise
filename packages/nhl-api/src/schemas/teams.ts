import { z } from "zod";
import {
	gameIdSchema,
	localeStringSchema,
	paginationSchema,
	seasonIdSchema,
	teamAbbrevSchema,
	teamIdSchema,
} from "./common.js";
import {
	gameTypeSchema,
	playerIdSchema,
	playerPositionCodeSchema,
} from "./players.js";

const nullableStringSchema = z.string().nullable().optional();
const nullableNumberSchema = z.number().nullable().optional();
const localeOrStringSchema = localeStringSchema.or(z.string());
const teamAbbrevOrLocaleSchema = teamAbbrevSchema.or(localeStringSchema);
const seasonIdOrStringSchema = seasonIdSchema.or(z.string().regex(/^\d{8}$/));

export const conferenceSchema = z
	.object({
		id: z.number().int().positive().optional(),
		name: localeOrStringSchema.optional(),
		abbrev: z.string().optional(),
	})
	.passthrough();

export const divisionSchema = z
	.object({
		id: z.number().int().positive().optional(),
		name: localeOrStringSchema.optional(),
		abbrev: z.string().optional(),
	})
	.passthrough();

export const teamIdentitySchema = z
	.object({
		id: teamIdSchema.optional(),
		teamId: teamIdSchema.optional(),
		abbrev: teamAbbrevSchema.optional(),
		teamAbbrev: teamAbbrevOrLocaleSchema.optional(),
		triCode: teamAbbrevSchema.optional(),
		fullName: localeOrStringSchema.optional(),
		name: localeOrStringSchema.optional(),
		placeName: localeOrStringSchema.optional(),
		commonName: localeOrStringSchema.optional(),
		logo: z.string().url().optional(),
		darkLogo: z.string().url().optional(),
		conference: conferenceSchema.optional(),
		division: divisionSchema.optional(),
		franchiseId: z.number().int().positive().optional(),
	})
	.passthrough();

export const teamRecordSchema = z
	.object({
		wins: z.number().int().nonnegative().optional(),
		losses: z.number().int().nonnegative().optional(),
		otLosses: z.number().int().nonnegative().optional(),
		ties: z.number().int().nonnegative().optional(),
		type: z.string().optional(),
	})
	.passthrough();

export const standingsRowSchema = teamIdentitySchema
	.extend({
		clinchIndicator: z.string().nullable().optional(),
		conferenceAbbrev: z.string().optional(),
		conferenceName: z.string().optional(),
		conferenceSequence: z.number().int().nonnegative().optional(),
		divisionAbbrev: z.string().optional(),
		divisionName: z.string().optional(),
		divisionSequence: z.number().int().nonnegative().optional(),
		gameTypeId: gameTypeSchema.optional(),
		gamesPlayed: z.number().int().nonnegative().optional(),
		goalDifferential: z.number().int().optional(),
		goalFor: z.number().int().nonnegative().optional(),
		goalAgainst: z.number().int().nonnegative().optional(),
		leagueSequence: z.number().int().nonnegative().optional(),
		points: z.number().int().nonnegative().optional(),
		regulationWins: z.number().int().nonnegative().optional(),
		seasonId: seasonIdSchema.optional(),
		streakCode: z.string().optional(),
		streakCount: z.number().int().nonnegative().optional(),
		teamCommonName: localeOrStringSchema.optional(),
		teamName: localeOrStringSchema.optional(),
		teamAbbrev: teamAbbrevOrLocaleSchema.optional(),
		waiversSequence: z.number().int().nonnegative().optional(),
		wildcardSequence: z.number().int().nonnegative().optional(),
		wins: z.number().int().nonnegative().optional(),
		losses: z.number().int().nonnegative().optional(),
		otLosses: z.number().int().nonnegative().optional(),
		records: z.array(teamRecordSchema).optional(),
	})
	.passthrough();

export const standingsSchema = z
	.object({
		standings: z.array(standingsRowSchema),
		date: z.string().optional(),
	})
	.passthrough();

export const clubStatsPlayerSchema = z
	.object({
		playerId: playerIdSchema.optional(),
		firstName: localeOrStringSchema.optional(),
		lastName: localeOrStringSchema.optional(),
		sweaterNumber: z.number().int().positive().nullable().optional(),
		positionCode: playerPositionCodeSchema.or(z.string()).optional(),
		gamesPlayed: nullableNumberSchema,
		goals: nullableNumberSchema,
		assists: nullableNumberSchema,
		points: nullableNumberSchema,
		wins: nullableNumberSchema,
		losses: nullableNumberSchema,
		savePctg: nullableNumberSchema,
		gaa: nullableNumberSchema,
	})
	.passthrough();

export const clubStatsSchema = z
	.object({
		season: seasonIdOrStringSchema.optional(),
		gameType: gameTypeSchema.optional(),
		gameTypeId: gameTypeSchema.optional(),
		skaters: z.array(clubStatsPlayerSchema).optional(),
		goalies: z.array(clubStatsPlayerSchema).optional(),
	})
	.passthrough();

export const rosterPlayerSummarySchema = z
	.object({
		id: playerIdSchema.optional(),
		playerId: playerIdSchema.optional(),
		firstName: localeOrStringSchema.optional(),
		lastName: localeOrStringSchema.optional(),
		sweaterNumber: z.number().int().positive().nullable().optional(),
		positionCode: playerPositionCodeSchema.or(z.string()).optional(),
		headshot: z.string().url().optional(),
		heightInInches: nullableNumberSchema,
		weightInPounds: nullableNumberSchema,
		birthDate: z.string().optional(),
		birthCountry: z.string().optional(),
		shootsCatches: z.string().optional(),
	})
	.passthrough();

export const rosterSchema = z
	.object({
		forwards: z.array(rosterPlayerSummarySchema).optional(),
		defensemen: z.array(rosterPlayerSummarySchema).optional(),
		goalies: z.array(rosterPlayerSummarySchema).optional(),
	})
	.passthrough();

export const prospectSummarySchema = rosterPlayerSummarySchema
	.extend({
		amateurClubName: nullableStringSchema,
		draftYear: nullableNumberSchema,
		draftRound: nullableNumberSchema,
		draftOverall: nullableNumberSchema,
		prospectCategory: z.number().int().positive().optional(),
	})
	.passthrough();

export const prospectsSchema = z
	.object({
		prospects: z.array(prospectSummarySchema).optional(),
		forwards: z.array(prospectSummarySchema).optional(),
		defensemen: z.array(prospectSummarySchema).optional(),
		goalies: z.array(prospectSummarySchema).optional(),
	})
	.passthrough();

export const teamGameSummarySchema = z
	.object({
		id: gameIdSchema.optional(),
		gameId: gameIdSchema.optional(),
		season: seasonIdSchema.optional(),
		gameType: gameTypeSchema.optional(),
		gameTypeId: gameTypeSchema.optional(),
		gameDate: z.string().optional(),
		startTimeUTC: z.string().optional(),
		venue: localeOrStringSchema.optional(),
		gameState: z.string().optional(),
		homeTeam: teamIdentitySchema.optional(),
		awayTeam: teamIdentitySchema.optional(),
	})
	.passthrough();

export const teamScheduleSchema = z
	.object({
		clubTimezone: z.string().optional(),
		games: z.array(teamGameSummarySchema),
		nextStartDate: z.string().optional(),
		previousStartDate: z.string().optional(),
		season: seasonIdSchema.optional(),
	})
	.passthrough();

export const teamScoreboardSchema = z
	.object({
		focusedDate: z.string().optional(),
		gamesByDate: z
			.array(
				z
					.object({
						date: z.string().optional(),
						games: z.array(teamGameSummarySchema),
					})
					.passthrough(),
			)
			.optional(),
		games: z.array(teamGameSummarySchema).optional(),
		team: teamIdentitySchema.optional(),
	})
	.passthrough();

export const statsTeamInfoSchema = z
	.object({
		id: teamIdSchema.optional(),
		teamId: teamIdSchema.optional(),
		franchiseId: z.number().int().positive().nullable().optional(),
		fullName: z.string().optional(),
		rawTricode: teamAbbrevSchema.optional(),
		triCode: teamAbbrevSchema.optional(),
		teamAbbrev: teamAbbrevSchema.optional(),
		teamName: z.string().optional(),
		locationName: z.string().optional(),
		firstYearOfPlay: nullableStringSchema,
	})
	.passthrough();

export const statsTeamStatSchema = z
	.object({
		teamId: teamIdSchema.optional(),
		teamFullName: z.string().optional(),
		teamName: z.string().optional(),
		teamAbbrev: teamAbbrevSchema.optional(),
		seasonId: seasonIdSchema.optional(),
		gameTypeId: gameTypeSchema.optional(),
		gamesPlayed: nullableNumberSchema,
		wins: nullableNumberSchema,
		losses: nullableNumberSchema,
		otLosses: nullableNumberSchema,
		points: nullableNumberSchema,
		goalsFor: nullableNumberSchema,
		goalsAgainst: nullableNumberSchema,
	})
	.passthrough();

export const statsFranchiseSchema = z
	.object({
		id: z.number().int().positive().optional(),
		franchiseId: z.number().int().positive().optional(),
		firstSeasonId: seasonIdSchema.nullable().optional(),
		lastSeasonId: seasonIdSchema.nullable().optional(),
		teamCommonName: nullableStringSchema,
		teamPlaceName: nullableStringSchema,
		fullName: z.string().optional(),
	})
	.passthrough();

export const statsTeamInfoResponseSchema = z
	.object({
		data: z.array(statsTeamInfoSchema),
		total: z.number().int().nonnegative().optional(),
	})
	.extend(paginationSchema.shape);

export const statsTeamStatsResponseSchema = z
	.object({
		data: z.array(statsTeamStatSchema),
		total: z.number().int().nonnegative().optional(),
	})
	.extend(paginationSchema.shape);

export const statsFranchiseResponseSchema = z
	.object({
		data: z.array(statsFranchiseSchema),
		total: z.number().int().nonnegative().optional(),
	})
	.extend(paginationSchema.shape);

export type ClubStats = z.infer<typeof clubStatsSchema>;
export type ClubStatsPlayer = z.infer<typeof clubStatsPlayerSchema>;
export type Conference = z.infer<typeof conferenceSchema>;
export type Division = z.infer<typeof divisionSchema>;
export type ProspectSummary = z.infer<typeof prospectSummarySchema>;
export type Prospects = z.infer<typeof prospectsSchema>;
export type Roster = z.infer<typeof rosterSchema>;
export type RosterPlayerSummary = z.infer<typeof rosterPlayerSummarySchema>;
export type Standings = z.infer<typeof standingsSchema>;
export type StandingsRow = z.infer<typeof standingsRowSchema>;
export type StatsFranchise = z.infer<typeof statsFranchiseSchema>;
export type StatsTeamInfo = z.infer<typeof statsTeamInfoSchema>;
export type StatsTeamStat = z.infer<typeof statsTeamStatSchema>;
export type TeamGameSummary = z.infer<typeof teamGameSummarySchema>;
export type TeamIdentity = z.infer<typeof teamIdentitySchema>;
export type TeamRecord = z.infer<typeof teamRecordSchema>;
export type TeamSchedule = z.infer<typeof teamScheduleSchema>;
export type TeamScoreboard = z.infer<typeof teamScoreboardSchema>;
