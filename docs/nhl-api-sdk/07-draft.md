# 07. Draft

## Goal

Add draft-domain endpoints for draft rankings, date-specific rankings, tracker data, picks, and Stats API draft information.

## Endpoint Coverage

- Draft rankings.
- Draft rankings by date.
- Draft tracker.
- Draft picks.
- Stats API draft information.

## Public SDK Surface

- `client.draft.getRankings(params)`
- `client.draft.getRankingsByDate(date, params?)`
- `client.draft.getTracker(params)`
- `client.draft.getPicks(params)`
- `client.draft.getInfo(params?)`

Export draft response schemas, query parameter types, and inferred result types.

## Zod/Schema Notes

- Model prospect identity, ranking source, position, amateur team, league, nationality, height, weight, and handedness.
- Model draft picks with round, pick numbers, team, prospect, and trade/status fields when present.
- Keep ranking payloads separate from pick payloads.
- Use shared team and player summary schemas only where the upstream shape matches.

## Test Plan

- Fixture-parse rankings, rankings by date, tracker, picks, and Stats API draft info responses.
- Verify draft year, date, round, team, and pagination query serialization.
- Verify schemas support undrafted prospects and drafted players.

## Acceptance Criteria

- Draft methods are grouped under `client.draft`.
- Fixtures cover rankings and actual pick data.
- Public schemas and types are exported.
- Tests verify both Web API and Stats API draft requests.

