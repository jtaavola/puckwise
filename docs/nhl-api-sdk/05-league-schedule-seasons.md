# 05. League Schedule and Seasons

## Goal

Add league-wide schedule and season endpoints for current schedules, date-specific schedules, schedule calendars, Web API seasons, and Stats API season metadata.

## Endpoint Coverage

- League schedule.
- Schedule by date.
- Schedule calendar.
- Web API seasons.
- Stats API component season endpoints.
- Stats API season endpoints.

## Public SDK Surface

- `client.schedule.getLeagueSchedule(params?)`
- `client.schedule.getByDate(date, options?)`
- `client.schedule.getCalendar(params?)`
- `client.seasons.getWebSeasons(params?)`
- `client.seasons.getComponentSeasons(params?)`
- `client.seasons.getStatsSeasons(params?)`

Export schedule and season response schemas, query parameter types, and inferred result types.

## Zod/Schema Notes

- Share date, season, game type, week, and game summary schemas with game and team domains.
- Model schedule groupings separately from individual game summaries.
- Keep Web API season payloads distinct from Stats API season payloads if field names differ.
- Validate date inputs as ISO date strings.

## Test Plan

- Fixture-parse league schedule, date schedule, and calendar responses.
- Fixture-parse Web API seasons and Stats API season responses.
- Verify date and season query serialization.
- Verify schedule game summaries remain compatible with game-domain shared schemas.

## Acceptance Criteria

- Schedule methods are grouped under `client.schedule`.
- Season methods are grouped under `client.seasons`.
- Fixtures cover current-season and historical-season examples.
- Tests cover both Web API and Stats API season sources.

