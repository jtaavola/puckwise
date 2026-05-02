export const standingsFixture = {
	date: "2024-04-18",
	standings: [
		{
			teamAbbrev: "EDM",
			teamName: { default: "Oilers" },
			teamCommonName: { default: "Oilers" },
			conferenceName: "Western",
			divisionName: "Pacific",
			leagueSequence: 5,
			divisionSequence: 2,
			wildcardSequence: 0,
			seasonId: 20232024,
			gamesPlayed: 82,
			wins: 49,
			losses: 27,
			otLosses: 6,
			points: 104,
			streakCode: "W",
			streakCount: 1,
			clinchIndicator: "x",
		},
	],
};

export const clubStatsFixture = {
	season: 20232024,
	gameType: 2,
	skaters: [
		{
			playerId: 8478402,
			firstName: { default: "Connor" },
			lastName: { default: "McDavid" },
			positionCode: "C",
			gamesPlayed: 76,
			goals: 32,
			assists: 100,
			points: 132,
		},
	],
	goalies: [
		{
			playerId: 8479973,
			firstName: { default: "Stuart" },
			lastName: { default: "Skinner" },
			positionCode: "G",
			gamesPlayed: 59,
			wins: 36,
			losses: 16,
			savePctg: 0.905,
			gaa: 2.62,
		},
	],
};

export const rosterFixture = {
	forwards: [
		{
			id: 8478402,
			firstName: { default: "Connor" },
			lastName: { default: "McDavid" },
			sweaterNumber: 97,
			positionCode: "C",
			headshot: "https://assets.nhle.com/mugs/nhl/latest/8478402.png",
		},
	],
	defensemen: [
		{
			id: 8476454,
			firstName: { default: "Mattias" },
			lastName: { default: "Ekholm" },
			sweaterNumber: 14,
			positionCode: "D",
		},
	],
	goalies: [
		{
			id: 8479973,
			firstName: { default: "Stuart" },
			lastName: { default: "Skinner" },
			sweaterNumber: 74,
			positionCode: "G",
		},
	],
};

export const prospectsFixture = {
	prospects: [
		{
			id: 8484314,
			firstName: { default: "Beau" },
			lastName: { default: "Akey" },
			positionCode: "D",
			amateurClubName: "Barrie",
			draftYear: 2023,
			draftRound: 2,
			draftOverall: 56,
		},
	],
};

export const teamScheduleFixture = {
	season: 20232024,
	clubTimezone: "America/Edmonton",
	games: [
		{
			id: 2023020007,
			season: 20232024,
			gameType: 2,
			gameDate: "2023-10-11",
			startTimeUTC: "2023-10-12T02:00:00Z",
			gameState: "OFF",
			awayTeam: {
				id: 22,
				abbrev: "EDM",
				score: 1,
			},
			homeTeam: {
				id: 23,
				abbrev: "VAN",
				score: 8,
			},
		},
	],
};

export const teamScoreboardFixture = {
	focusedDate: "2024-04-18",
	team: {
		id: 22,
		abbrev: "EDM",
		name: { default: "Edmonton Oilers" },
	},
	games: [
		{
			id: 2023021304,
			season: 20232024,
			gameType: 2,
			gameDate: "2024-04-18",
			gameState: "OFF",
			homeTeam: {
				id: 22,
				abbrev: "EDM",
				score: 5,
			},
			awayTeam: {
				id: 21,
				abbrev: "COL",
				score: 1,
			},
		},
	],
};

export const statsTeamInfoFixture = {
	data: [
		{
			id: 22,
			franchiseId: 25,
			fullName: "Edmonton Oilers",
			rawTricode: "EDM",
			triCode: "EDM",
			teamName: "Oilers",
			locationName: "Edmonton",
			firstYearOfPlay: "1979",
		},
	],
	total: 1,
};

export const statsTeamStatsFixture = {
	data: [
		{
			teamId: 22,
			teamFullName: "Edmonton Oilers",
			teamAbbrev: "EDM",
			seasonId: 20232024,
			gameTypeId: 2,
			gamesPlayed: 82,
			wins: 49,
			losses: 27,
			otLosses: 6,
			points: 104,
			goalsFor: 292,
			goalsAgainst: 236,
		},
	],
	total: 1,
};

export const statsFranchiseFixture = {
	data: [
		{
			id: 25,
			franchiseId: 25,
			firstSeasonId: 19791980,
			lastSeasonId: null,
			teamPlaceName: "Edmonton",
			teamCommonName: "Oilers",
			fullName: "Edmonton Oilers",
		},
	],
	total: 1,
};
