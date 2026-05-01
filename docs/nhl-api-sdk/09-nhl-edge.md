# 09. NHL Edge

## Goal

Add NHL Edge endpoints for team, skater, goalie, and CAT detail data.

## Endpoint Coverage

- Team edge endpoints.
- Skater edge endpoints.
- Goalie edge endpoints.
- CAT detail endpoints where documented.

## Public SDK Surface

- `client.edge.getTeams(params)`
- `client.edge.getTeam(teamIdOrAbbrev, params?)`
- `client.edge.getSkaters(params)`
- `client.edge.getSkater(playerId, params?)`
- `client.edge.getGoalies(params)`
- `client.edge.getGoalie(playerId, params?)`
- `client.edge.getCatDetails(params)`

Export NHL Edge response schemas, query parameter types, and inferred result types.

## Zod/Schema Notes

- Keep NHL Edge schemas separate from standard Web API and Stats API schemas unless fields are identical.
- Model percentile/ranking fields, measured values, units, sample sizes, and season context explicitly.
- Separate skater and goalie metrics because their categories differ.
- Represent CAT detail payloads with typed known fields plus constrained passthrough for documented dynamic metric groups.

## Test Plan

- Fixture-parse team, skater, goalie, and CAT detail responses.
- Verify Edge base URL selection.
- Verify query serialization for season, game type, team, player, category, and pagination filters.
- Verify metric fields preserve numeric precision.

## Acceptance Criteria

- NHL Edge methods are grouped under `client.edge`.
- Fixtures cover one team, one skater, one goalie, and one CAT detail response.
- Tests prove Edge requests do not use Web API or Stats API base URLs.
- Public schemas and types are exported from the package entrypoint.

