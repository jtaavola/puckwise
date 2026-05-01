export const playerLandingSkaterFixture = {
	playerId: 8478402,
	firstName: { default: "Connor" },
	lastName: { default: "McDavid" },
	fullTeamName: { default: "Edmonton Oilers" },
	currentTeamAbbrev: "EDM",
	currentTeamId: 22,
	positionCode: "C",
	shootsCatches: "L",
	headshot: "https://assets.nhle.com/mugs/nhl/latest/8478402.png",
	heroImage: "https://assets.nhle.com/mugs/actionshots/8478402.jpg",
	seasonTotals: [
		{
			assists: 100,
			gameTypeId: 2,
			gamesPlayed: 76,
			goals: 32,
			points: 132,
			season: 20232024,
			teamName: { default: "Edmonton Oilers" },
		},
	],
	careerTotals: {
		regularSeason: { assists: 647, goals: 335, points: 982 },
	},
};

export const playerLandingGoalieFixture = {
	playerId: 8476999,
	firstName: { default: "Connor" },
	lastName: { default: "Hellebuyck" },
	currentTeamAbbrev: "WPG",
	currentTeamId: 52,
	positionCode: "G",
	shootsCatches: "L",
	seasonTotals: [
		{
			gameTypeId: 2,
			gamesPlayed: 60,
			gaa: 2.39,
			savePctg: 0.921,
			season: 20232024,
			shutouts: 5,
			wins: 37,
		},
	],
	careerTotals: {
		regularSeason: { gamesPlayed: 505, savePctg: 0.917, wins: 275 },
	},
};

export const playerGameLogFixture = {
	seasonId: 20232024,
	gameTypeId: 2,
	gameLog: [
		{
			assists: 2,
			gameDate: "2023-10-11",
			gameId: 2023020007,
			gameTypeId: 2,
			goals: 0,
			homeRoadFlag: "R",
			opponentAbbrev: "VAN",
			points: 2,
			season: 20232024,
			teamAbbrev: "EDM",
			toi: "21:13",
		},
	],
};

export const statsPlayerInfoFixture = {
	data: [
		{
			birthCity: "Richmond Hill",
			birthCountryCode: "CAN",
			birthDate: "1997-01-13",
			currentTeamAbbrev: "EDM",
			currentTeamId: 22,
			firstName: "Connor",
			fullName: "Connor McDavid",
			isActive: true,
			lastName: "McDavid",
			playerId: 8478402,
			positionCode: "C",
			shootsCatches: "L",
		},
	],
	total: 1,
};

export const statsSkaterStatsFixture = {
	data: [
		{
			assists: 100,
			gameTypeId: 2,
			gamesPlayed: 76,
			goals: 32,
			playerId: 8478402,
			playerName: "Connor McDavid",
			points: 132,
			positionCode: "C",
			seasonId: 20232024,
			teamAbbrevs: "EDM",
			teamId: 22,
		},
	],
	total: 1,
};

export const statsGoalieStatsFixture = {
	data: [
		{
			gameTypeId: 2,
			gamesPlayed: 60,
			gaa: 2.39,
			playerId: 8476999,
			playerName: "Connor Hellebuyck",
			savePct: 0.921,
			seasonId: 20232024,
			teamAbbrevs: "WPG",
			teamId: 52,
			wins: 37,
		},
	],
	total: 1,
};

export const statsLeaderFixture = {
	data: [
		{
			playerId: 8478402,
			playerName: "Connor McDavid",
			rank: 1,
			teamAbbrev: "EDM",
			value: 132,
		},
	],
	total: 1,
};

export const statsMilestoneFixture = {
	data: [
		{
			achievementDate: "2024-04-15",
			firstName: "Connor",
			lastName: "McDavid",
			milestone: "Assists",
			milestoneAmount: 100,
			playerId: 8478402,
			teamAbbrev: "EDM",
		},
	],
	total: 1,
};

export const playerSpotlightFixture = {
	players: [
		{
			playerId: 8478402,
			firstName: { default: "Connor" },
			lastName: { default: "McDavid" },
			positionCode: "C",
			teamAbbrev: "EDM",
			teamId: 22,
		},
	],
};
