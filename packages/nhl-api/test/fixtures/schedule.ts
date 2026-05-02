export const leagueScheduleFixture = {
	nextStartDate: "2024-10-11",
	previousStartDate: "2024-09-27",
	gameWeek: [
		{
			date: "2024-10-04",
			dayAbbrev: "FRI",
			numberOfGames: 1,
			datePromo: [],
			games: [
				{
					id: 2024020001,
					season: 20242025,
					gameType: 2,
					venue: { default: "O2 Czech Republic" },
					neutralSite: true,
					startTimeUTC: "2024-10-04T17:00:00Z",
					easternUTCOffset: "-04:00",
					venueUTCOffset: "+02:00",
					venueTimezone: "Europe/Prague",
					gameState: "OFF",
					gameScheduleState: "OK",
					tvBroadcasts: [
						{
							id: 324,
							market: "N",
							countryCode: "US",
							network: "NHLN",
							sequenceNumber: 35,
						},
					],
					awayTeam: {
						id: 1,
						commonName: { default: "Devils" },
						placeName: { default: "New Jersey" },
						abbrev: "NJD",
						logo: "https://assets.nhle.com/logos/nhl/svg/NJD_light.svg",
						darkLogo: "https://assets.nhle.com/logos/nhl/svg/NJD_dark.svg",
						awaySplitSquad: false,
						score: 4,
					},
					homeTeam: {
						id: 7,
						commonName: { default: "Sabres" },
						placeName: { default: "Buffalo" },
						abbrev: "BUF",
						logo: "https://assets.nhle.com/logos/nhl/svg/BUF_light.svg",
						darkLogo: "https://assets.nhle.com/logos/nhl/svg/BUF_dark.svg",
						homeSplitSquad: false,
						score: 1,
					},
					periodDescriptor: {
						number: 3,
						periodType: "REG",
						maxRegulationPeriods: 3,
					},
					gameOutcome: { lastPeriodType: "REG" },
					winningGoalie: {
						playerId: 8474593,
						firstInitial: { default: "J." },
						lastName: { default: "Markstrom" },
					},
					winningGoalScorer: {
						playerId: 8480192,
						firstInitial: { default: "J." },
						lastName: { default: "Kovacevic" },
					},
					gameCenterLink: "/gamecenter/njd-vs-buf/2024/10/04/2024020001",
				},
			],
		},
	],
};

export const historicalScheduleFixture = {
	nextStartDate: "2024-01-20",
	previousStartDate: "2024-01-06",
	gameWeek: [
		{
			date: "2024-01-13",
			dayAbbrev: "SAT",
			numberOfGames: 1,
			games: [
				{
					id: 2023020657,
					season: 20232024,
					gameType: 2,
					gameState: "OFF",
					gameScheduleState: "OK",
					awayTeam: {
						id: 30,
						abbrev: "MIN",
						score: 1,
					},
					homeTeam: {
						id: 53,
						abbrev: "ARI",
						score: 6,
					},
				},
			],
		},
	],
};

export const scheduleCalendarFixture = {
	startDate: "2024-10-04",
	endDate: "2024-10-10",
	nextStartDate: "2024-10-11",
	previousStartDate: "2024-09-27",
	teams: [
		{
			id: 1,
			seasonId: 20242025,
			commonName: { default: "Devils" },
			abbrev: "NJD",
			name: { default: "New Jersey Devils", fr: "Devils du New Jersey" },
			placeName: { default: "New Jersey" },
			logo: "https://assets.nhle.com/logos/nhl/svg/NJD_light.svg",
			darkLogo: "https://assets.nhle.com/logos/nhl/svg/NJD_dark.svg",
			french: false,
		},
	],
};

export const webSeasonsFixture = [
	19171918, 19181919, 20222023, 20232024, 20242025, 20252026,
];

export const statsComponentSeasonsFixture = {
	data: [
		{
			id: 45,
			component: "StatsHome",
			gameTypeId: 3,
			seasonId: 20252026,
		},
		{
			id: 44,
			component: "StatsHome",
			gameTypeId: 2,
			seasonId: 20242025,
		},
	],
	total: 2,
};

export const statsSeasonsFixture = {
	data: [
		{
			id: 20242025,
			allStarGameInUse: 1,
			conferencesInUse: 1,
			divisionsInUse: 1,
			endDate: "2025-06-17T20:00:00",
			formattedSeasonId: "2024-25",
			numberOfGames: 82,
			preseasonStartdate: "2024-09-21T19:00:00",
			regularSeasonEndDate: "2025-04-17T21:00:00",
			rowInUse: 1,
			seasonOrdinal: 107,
			startDate: "2024-10-04T13:00:00",
			totalPlayoffGames: 86,
			totalRegularSeasonGames: 1312,
		},
		{
			id: 19531954,
			allStarGameInUse: 1,
			conferencesInUse: 0,
			divisionsInUse: 0,
			endDate: "1954-04-16T20:00:00",
			formattedSeasonId: "1953-54",
			numberOfGames: 70,
			preseasonStartdate: null,
			regularSeasonEndDate: "1954-03-21T20:00:00",
			rowInUse: 0,
			seasonOrdinal: 37,
			startDate: "1953-10-08T20:00:00",
			totalPlayoffGames: 16,
			totalRegularSeasonGames: 210,
		},
	],
	total: 2,
};
