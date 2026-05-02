export const finalGameSummary = {
	awayTeam: {
		abbrev: "EDM",
		id: 22,
		name: { default: "Oilers" },
		score: 4,
		sog: 31,
	},
	gameDate: "2024-06-24",
	gameScheduleState: "OK",
	gameState: "OFF",
	gameType: 3,
	homeTeam: {
		abbrev: "FLA",
		id: 13,
		name: { default: "Panthers" },
		score: 2,
		sog: 24,
	},
	id: 2023030417,
	season: 20232024,
	startTimeUTC: "2024-06-25T00:00:00Z",
	venue: { default: "Amerant Bank Arena" },
};

export const liveGameSummary = {
	awayTeam: {
		abbrev: "MIN",
		id: 30,
		name: { default: "Wild" },
		score: 1,
	},
	clock: {
		inIntermission: false,
		running: true,
		timeRemaining: "12:08",
	},
	gameDate: "2026-01-15",
	gameScheduleState: "OK",
	gameState: "LIVE",
	gameType: 2,
	homeTeam: {
		abbrev: "DAL",
		id: 25,
		name: { default: "Stars" },
		score: 1,
	},
	periodDescriptor: {
		number: 2,
		periodType: "REG",
	},
	id: 2025020701,
	season: 20252026,
	startTimeUTC: "2026-01-16T01:00:00Z",
};

export const scoresFixture = {
	currentDate: "2024-06-24",
	games: [finalGameSummary],
	nextDate: "2024-06-25",
	prevDate: "2024-06-23",
};

export const scoreboardFixture = {
	focusedDate: "2026-01-15",
	gamesByDate: [
		{
			date: "2026-01-15",
			games: [liveGameSummary],
		},
	],
};

export const boxscoreFixture = {
	awayTeam: {
		...finalGameSummary.awayTeam,
		forwards: [
			{
				assists: 2,
				firstName: { default: "Connor" },
				goals: 1,
				lastName: { default: "McDavid" },
				playerId: 8478402,
				positionCode: "C",
				shots: 4,
				sweaterNumber: 97,
			},
		],
		goalies: [
			{
				playerId: 8479973,
				positionCode: "G",
				saves: 22,
			},
		],
	},
	gameDate: finalGameSummary.gameDate,
	gameId: finalGameSummary.id,
	gameState: finalGameSummary.gameState,
	homeTeam: {
		...finalGameSummary.homeTeam,
		forwards: [],
		goalies: [],
	},
	season: finalGameSummary.season,
};

export const landingFixture = {
	...boxscoreFixture,
	summary: {
		scoring: [
			{
				periodDescriptor: { number: 1 },
				goals: [
					{
						name: { default: "Connor McDavid" },
						playerId: 8478402,
						teamAbbrev: "EDM",
						timeInPeriod: "06:22",
					},
				],
			},
		],
		teamGameStats: [],
	},
};

export const playByPlayFixture = {
	...finalGameSummary,
	plays: [
		{
			details: {
				eventOwnerTeamId: 22,
				scoringPlayerId: 8478402,
			},
			eventId: 12,
			periodDescriptor: { number: 1, periodType: "REG" },
			sortOrder: 45,
			timeInPeriod: "06:22",
			typeCode: 505,
			typeDescKey: "goal",
		},
		{
			eventId: 14,
			periodDescriptor: { number: 1, periodType: "REG" },
			sortOrder: 46,
			timeInPeriod: "07:02",
			typeCode: 516,
			typeDescKey: "stoppage",
		},
	],
	rosterSpots: [{ playerId: 8478402, teamId: 22 }],
};

export const storyFixture = {
	gameId: finalGameSummary.id,
	modules: [
		{
			type: "recap",
			title: "Oilers win Game 7",
		},
	],
};

export const statsGameInfoFixture = {
	data: [
		{
			awayTeamId: 22,
			gameDate: "2024-06-24",
			gameId: finalGameSummary.id,
			gameStateId: 7,
			gameTypeId: 3,
			homeTeamId: 13,
			seasonId: 20232024,
		},
	],
	total: 1,
};

export const statsGameMetadataFixture = {
	data: [
		{
			fieldName: "gameStateId",
			type: "integer",
		},
	],
};

export const shiftChartsFixture = {
	data: [
		{
			duration: "00:42",
			endTime: "00:42",
			gameId: finalGameSummary.id,
			period: 1,
			playerId: 8478402,
			startTime: "00:00",
			teamAbbrev: "EDM",
		},
	],
	total: 1,
};

export const streamsFixture = {
	countries: [
		{
			code: "US",
			providers: [{ name: "ESPN+" }],
		},
	],
};

export const tvScheduleFixture = {
	date: "2024-06-24",
	games: [
		{
			gameId: finalGameSummary.id,
			networks: ["ABC"],
		},
	],
};

export const oddsFixture = {
	countryCode: "US",
	games: [
		{
			gameId: finalGameSummary.id,
			odds: [{ provider: "example", awayTeamOdds: "+120" }],
		},
	],
};

export const replayFixture = {
	eventNumber: 12,
	gameId: finalGameSummary.id,
	replays: [{ angle: "main", url: "https://example.test/replay.mp4" }],
};

export const wscPlayByPlayFixture = {
	gameId: finalGameSummary.id,
	plays: [
		{
			clipId: 123,
			eventId: 12,
			typeDescKey: "goal",
		},
	],
};
