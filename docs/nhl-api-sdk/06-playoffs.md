# 06. Playoffs

## Goal

Add playoff endpoints for series navigation, series schedules, bracket data, and playoff metadata.

## Endpoint Coverage

- Series carousel.
- Series schedule.
- Playoff bracket.
- Playoff metadata.

## Public SDK Surface

- `client.playoffs.getSeriesCarousel(params)`
- `client.playoffs.getSeriesSchedule(params)`
- `client.playoffs.getBracket(params)`
- `client.playoffs.getMetadata(params?)`

Export playoff response schemas, query parameter types, and inferred result types.

## Zod/Schema Notes

- Model playoff rounds, series IDs, series status, seeds, matchup teams, aggregate wins, and clinch state.
- Reuse game summary schemas for series schedule games.
- Keep bracket layout fields separate from semantic series data.
- Represent metadata as typed fields where stable and passthrough only where upstream shape is display-oriented.

## Test Plan

- Fixture-parse series carousel, series schedule, bracket, and metadata responses.
- Verify season, round, series, and locale query parameters.
- Verify bracket schemas handle completed and in-progress series.

## Acceptance Criteria

- Playoff methods are grouped under `client.playoffs`.
- Fixtures include at least one completed series and one in-progress or scheduled series shape.
- Tests verify schema compatibility with shared game and team summaries.
- Public schemas and types are exported from the package entrypoint.

