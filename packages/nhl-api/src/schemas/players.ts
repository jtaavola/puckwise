import { z } from "zod";
import {
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

export const playerIdentitySchema = z.looseObject({
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
});

export const playerTeamSchema = z.looseObject({
	id: z.number().int().positive().optional(),
	teamId: z.number().int().positive().optional(),
	abbrev: teamAbbrevSchema.optional(),
	triCode: teamAbbrevSchema.optional(),
	name: localeStringSchema.or(z.string()).optional(),
	placeName: localeStringSchema.or(z.string()).optional(),
	logo: z.string().url().optional(),
	darkLogo: z.string().url().optional(),
});

export const skaterSeasonTotalSchema = z.looseObject({
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
});

export const goalieSeasonTotalSchema = z.looseObject({
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
});

const fullTeamNameSchema = z.looseObject({
	default: z.string().optional(),
	fr: z.string().optional(),
});

const teamCommonNameSchema = z.looseObject({
	default: z.string().optional(),
});

const teamPlaceNameWithPrepositionSchema = z.looseObject({
	default: z.string().optional(),
	fr: z.string().optional(),
});

const firstNameSchema = z.looseObject({
	default: z.string(),
});

const lastNameSchema = z.looseObject({
	default: z.string(),
});

const birthCitySchema = z.looseObject({
	default: z.string().optional(),
});

const birthStateProvinceSchema = z.looseObject({
	default: z.string().optional(),
});

const draftDetailsSchema = z.looseObject({
	year: z.number().optional(),
	teamAbbrev: z.string().optional(),
	round: z.number().optional(),
	pickInRound: z.number().optional(),
	overallPick: z.number().optional(),
});

const featuredStatsRegularSeasonSubSeasonSchema = z.looseObject({
	assists: z.number().optional(),
	gameWinningGoals: z.number().optional(),
	gamesPlayed: z.number().optional(),
	goals: z.number().optional(),
	otGoals: z.number().optional(),
	pim: z.number().optional(),
	plusMinus: z.number().optional(),
	points: z.number().optional(),
	powerPlayGoals: z.number().optional(),
	powerPlayPoints: z.number().optional(),
	shootingPctg: z.number().optional(),
	shorthandedGoals: z.number().optional(),
	shorthandedPoints: z.number().optional(),
	shots: z.number().optional(),
});

const featuredStatsRegularSeasonCareerSchema = z.looseObject({
	assists: z.number().optional(),
	gameWinningGoals: z.number().optional(),
	gamesPlayed: z.number().optional(),
	goals: z.number().optional(),
	otGoals: z.number().optional(),
	pim: z.number().optional(),
	plusMinus: z.number().optional(),
	points: z.number().optional(),
	powerPlayGoals: z.number().optional(),
	powerPlayPoints: z.number().optional(),
	shootingPctg: z.number().optional(),
	shorthandedGoals: z.number().optional(),
	shorthandedPoints: z.number().optional(),
	shots: z.number().optional(),
});

const featuredStatsRegularSeasonSchema = z.looseObject({
	subSeason: featuredStatsRegularSeasonSubSeasonSchema.optional(),
	career: featuredStatsRegularSeasonCareerSchema.optional(),
});

const featuredStatsPlayoffsSubSeasonSchema = z.looseObject({
	assists: z.number().optional(),
	gameWinningGoals: z.number().optional(),
	gamesPlayed: z.number().optional(),
	goals: z.number().optional(),
	otGoals: z.number().optional(),
	pim: z.number().optional(),
	plusMinus: z.number().optional(),
	points: z.number().optional(),
	powerPlayGoals: z.number().optional(),
	powerPlayPoints: z.number().optional(),
	shootingPctg: z.number().optional(),
	shorthandedGoals: z.number().optional(),
	shorthandedPoints: z.number().optional(),
	shots: z.number().optional(),
});

const featuredStatsPlayoffsCareerSchema = z.looseObject({
	assists: z.number().optional(),
	gameWinningGoals: z.number().optional(),
	gamesPlayed: z.number().optional(),
	goals: z.number().optional(),
	otGoals: z.number().optional(),
	pim: z.number().optional(),
	plusMinus: z.number().optional(),
	points: z.number().optional(),
	powerPlayGoals: z.number().optional(),
	powerPlayPoints: z.number().optional(),
	shootingPctg: z.number().optional(),
	shorthandedGoals: z.number().optional(),
	shorthandedPoints: z.number().optional(),
	shots: z.number().optional(),
});

const featuredStatsPlayoffsSchema = z.looseObject({
	subSeason: featuredStatsPlayoffsSubSeasonSchema.optional(),
	career: featuredStatsPlayoffsCareerSchema.optional(),
});

const featuredStatsSchema = z.looseObject({
	season: z.number().optional(),
	regularSeason: featuredStatsRegularSeasonSchema.optional(),
	playoffs: featuredStatsPlayoffsSchema.optional(),
});

const careerTotalsRegularSeasonSchema = z.looseObject({
	assists: z.number().optional(),
	avgToi: z.string().optional(),
	faceoffWinningPctg: z.number().optional(),
	gameWinningGoals: z.number().optional(),
	gamesPlayed: z.number().optional(),
	goals: z.number().optional(),
	otGoals: z.number().optional(),
	pim: z.number().optional(),
	plusMinus: z.number().optional(),
	points: z.number().optional(),
	powerPlayGoals: z.number().optional(),
	powerPlayPoints: z.number().optional(),
	shootingPctg: z.number().optional(),
	shorthandedGoals: z.number().optional(),
	shorthandedPoints: z.number().optional(),
	shots: z.number().optional(),
});

const careerTotalsPlayoffsSchema = z.looseObject({
	assists: z.number().optional(),
	avgToi: z.string().optional(),
	faceoffWinningPctg: z.number().optional(),
	gameWinningGoals: z.number().optional(),
	gamesPlayed: z.number().optional(),
	goals: z.number().optional(),
	otGoals: z.number().optional(),
	pim: z.number().optional(),
	plusMinus: z.number().optional(),
	points: z.number().optional(),
	powerPlayGoals: z.number().optional(),
	powerPlayPoints: z.number().optional(),
	shootingPctg: z.number().optional(),
	shorthandedGoals: z.number().optional(),
	shorthandedPoints: z.number().optional(),
	shots: z.number().optional(),
});

const careerTotalsSchema = z.looseObject({
	regularSeason: careerTotalsRegularSeasonSchema.optional(),
	playoffs: careerTotalsPlayoffsSchema.optional(),
});

const last5GamesItemSchema = z.looseObject({
	assists: z.number().optional(),
	gameDate: z.string().optional(),
	gameId: z.number().optional(),
	gameTypeId: z.number().optional(),
	goals: z.number().optional(),
	homeRoadFlag: z.string().optional(),
	opponentAbbrev: z.string().optional(),
	pim: z.number().optional(),
	plusMinus: z.number().optional(),
	points: z.number().optional(),
	powerPlayGoals: z.number().optional(),
	shifts: z.number().optional(),
	shorthandedGoals: z.number().optional(),
	shots: z.number().optional(),
	teamAbbrev: z.string().optional(),
	toi: z.string().optional(),
});

const seasonTotalsItemTeamNameSchema = z.looseObject({
	default: z.string().optional(),
	cs: z.string().optional(),
	de: z.string().optional(),
	es: z.string().optional(),
	fi: z.string().optional(),
	sk: z.string().optional(),
	sv: z.string().optional(),
	fr: z.string().optional(),
});

const seasonTotalsItemTeamCommonNameSchema = z.looseObject({
	default: z.string().optional(),
	cs: z.string().optional(),
	de: z.string().optional(),
	es: z.string().optional(),
	fi: z.string().optional(),
	sk: z.string().optional(),
	sv: z.string().optional(),
});

const seasonTotalsItemTeamPlaceNameWithPrepositionSchema = z.looseObject({
	default: z.string().optional(),
	fr: z.string().optional(),
});

const seasonTotalsItemSchema = z.looseObject({
	assists: z.number().optional(),
	gameTypeId: z.number().optional(),
	gamesPlayed: z.number().optional(),
	goals: z.number().optional(),
	leagueAbbrev: z.string().optional(),
	pim: z.number().optional(),
	points: z.number().optional(),
	season: z.number().optional(),
	sequence: z.number().optional(),
	teamName: seasonTotalsItemTeamNameSchema.optional(),
	gameWinningGoals: z.number().optional(),
	plusMinus: z.number().optional(),
	powerPlayGoals: z.number().optional(),
	shorthandedGoals: z.number().optional(),
	shots: z.number().optional(),
	teamCommonName: seasonTotalsItemTeamCommonNameSchema.optional(),
	teamPlaceNameWithPreposition:
		seasonTotalsItemTeamPlaceNameWithPrepositionSchema.optional(),
	avgToi: z.string().optional(),
	faceoffWinningPctg: z.number().optional(),
	otGoals: z.number().optional(),
	powerPlayPoints: z.number().optional(),
	shootingPctg: z.number().optional(),
	shorthandedPoints: z.number().optional(),
});

const awardsItemTrophySchema = z.looseObject({
	default: z.string().optional(),
	fr: z.string().optional(),
});

const awardsItemSeasonsItemSchema = z.looseObject({
	assists: z.number().optional(),
	blockedShots: z.number().optional(),
	gameTypeId: z.number().optional(),
	gamesPlayed: z.number().optional(),
	goals: z.number().optional(),
	hits: z.number().optional(),
	pim: z.number().optional(),
	plusMinus: z.number().optional(),
	points: z.number().optional(),
	seasonId: z.number().optional(),
});

const awardsItemSchema = z.looseObject({
	trophy: awardsItemTrophySchema.optional(),
	seasons: z.array(awardsItemSeasonsItemSchema).optional(),
});

const currentTeamRosterItemLastNameSchema = z.looseObject({
	default: z.string().optional(),
});

const currentTeamRosterItemFirstNameSchema = z.looseObject({
	default: z.string().optional(),
	cs: z.string().optional(),
	fi: z.string().optional(),
	sk: z.string().optional(),
});

const currentTeamRosterItemSchema = z.looseObject({
	playerId: z.number().optional(),
	lastName: currentTeamRosterItemLastNameSchema.optional(),
	firstName: currentTeamRosterItemFirstNameSchema.optional(),
	playerSlug: z.string().optional(),
});

export const playerLandingSchema = z.looseObject({
	playerId: z.number(),
	isActive: z.boolean().optional(),
	currentTeamId: z.number().optional(),
	currentTeamAbbrev: z.string().optional(),
	fullTeamName: fullTeamNameSchema.optional(),
	teamCommonName: teamCommonNameSchema.optional(),
	teamPlaceNameWithPreposition: teamPlaceNameWithPrepositionSchema.optional(),
	firstName: firstNameSchema,
	lastName: lastNameSchema,
	badges: z.array(z.unknown()).optional(),
	teamLogo: z.string().optional(),
	sweaterNumber: z.number().optional(),
	position: z.string().optional(),
	headshot: z.string().optional(),
	heroImage: z.string().optional(),
	heightInInches: z.number().optional(),
	heightInCentimeters: z.number().optional(),
	weightInPounds: z.number().optional(),
	weightInKilograms: z.number().optional(),
	birthDate: z.string().optional(),
	birthCity: birthCitySchema.optional(),
	birthStateProvince: birthStateProvinceSchema.optional(),
	birthCountry: z.string().optional(),
	shootsCatches: z.string().optional(),
	draftDetails: draftDetailsSchema.optional(),
	playerSlug: z.string().optional(),
	inTop100AllTime: z.number().optional(),
	inHHOF: z.number().optional(),
	featuredStats: featuredStatsSchema.optional(),
	careerTotals: careerTotalsSchema.optional(),
	shopLink: z.string().optional(),
	twitterLink: z.string().optional(),
	watchLink: z.string().optional(),
	last5Games: z.array(last5GamesItemSchema).optional(),
	seasonTotals: z.array(seasonTotalsItemSchema).optional(),
	awards: z.array(awardsItemSchema).optional(),
	currentTeamRoster: z.array(currentTeamRosterItemSchema).optional(),
});

const playerStatsSeasonsItemSchema = z.looseObject({
	season: z.number(),
	gameTypes: z.array(z.number()).optional(),
});

const gameLogItemCommonNameSchema = z.looseObject({
	default: z.string().optional(),
});

const gameLogItemOpponentCommonNameSchema = z.looseObject({
	default: z.string().optional(),
	fr: z.string().optional(),
});

const gameLogItemSchema = z.looseObject({
	gameId: z.number(),
	teamAbbrev: z.string().optional(),
	homeRoadFlag: z.string().optional(),
	gameDate: z.string().optional(),
	goals: z.number().optional(),
	assists: z.number().optional(),
	commonName: gameLogItemCommonNameSchema.optional(),
	opponentCommonName: gameLogItemOpponentCommonNameSchema.optional(),
	points: z.number().optional(),
	plusMinus: z.number().optional(),
	powerPlayGoals: z.number().optional(),
	powerPlayPoints: z.number().optional(),
	gameWinningGoals: z.number().optional(),
	otGoals: z.number().optional(),
	shots: z.number().optional(),
	shifts: z.number().optional(),
	shorthandedGoals: z.number().optional(),
	shorthandedPoints: z.number().optional(),
	opponentAbbrev: z.string().optional(),
	pim: z.number().optional(),
	toi: z.string().optional(),
});

export const playerGameLogSchema = z.looseObject({
	seasonId: z.number(),
	gameTypeId: z.number(),
	playerStatsSeasons: z.array(playerStatsSeasonsItemSchema).optional(),
	gameLog: z.array(gameLogItemSchema).optional(),
});

export const playerSpotlightItemSchema = playerIdentitySchema.extend({
	team: playerTeamSchema.optional(),
	teamAbbrev: teamAbbrevSchema.optional(),
	teamId: z.number().int().positive().optional(),
});

export const playerSpotlightSchema = z.looseObject({
	players: z.array(playerSpotlightItemSchema),
});

export const statsPlayerInfoSchema = z
	.looseObject({
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

export const statsSkaterStatSchema = z.looseObject({
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
});

export const statsGoalieStatSchema = z.looseObject({
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
});

export const statsLeaderSchema = z.looseObject({
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	playerId: playerIdSchema.optional(),
	playerName: z.string().optional(),
	positionCode: playerPositionCodeSchema.or(z.string()).optional(),
	rank: z.number().int().positive().optional(),
	teamAbbrev: teamAbbrevSchema.optional(),
	teamId: z.number().int().positive().optional(),
	value: z.number().optional(),
});

export const statsMilestoneSchema = z.looseObject({
	achievementDate: z.string().nullable().optional(),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	milestone: z.string().optional(),
	milestoneAmount: nullableNumberSchema,
	playerId: playerIdSchema.optional(),
	teamAbbrev: teamAbbrevSchema.optional(),
});

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
