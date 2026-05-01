# 03. Teams

## Goal

Add team-domain endpoints for standings, club statistics, rosters, prospects, schedules, scoreboard data, team info, team stats, and franchise data.

## Endpoint Coverage

- Web API standings.
- Web API club stats.
- Web API rosters and prospects.
- Web API team schedules.
- Web API team scoreboard.
- Stats API team information.
- Stats API team by ID.
- Stats API team stats.
- Stats API franchise information.

## Public SDK Surface

- `client.teams.getStandings(params?)`
- `client.teams.getClubStats(teamAbbrev, params)`
- `client.teams.getRoster(teamAbbrev, params?)`
- `client.teams.getProspects(teamAbbrev, params?)`
- `client.teams.getSchedule(teamAbbrev, params)`
- `client.teams.getScoreboard(teamAbbrev, params?)`
- `client.teams.getInfo(params?)`
- `client.teams.getById(teamId, options?)`
- `client.teams.getStats(params)`
- `client.teams.getFranchises(params?)`

Export team response schemas, query parameter types, and inferred result types.

## Zod/Schema Notes

- Share schemas for team IDs, abbreviations, names, conference, division, and franchise fields.
- Keep roster player summaries separate from full player-domain schemas.
- Model standings rows with points, games played, records, streaks, ranks, and clinch indicators.
- Model schedule and scoreboard game summaries using shared game summary schemas where available.

## Test Plan

- Fixture-parse standings, roster, prospects, schedule, and scoreboard responses.
- Fixture-parse Stats API team info, team by ID, team stats, and franchise responses.
- Verify path construction for team abbreviations and team IDs.
- Verify season, date, game type, and pagination filters.

## Acceptance Criteria

- Team-domain methods are grouped under `client.teams`.
- Team and franchise schemas are exported.
- Fixtures cover at least one current team and one franchise response.
- Tests verify both Web API and Stats API request paths.

