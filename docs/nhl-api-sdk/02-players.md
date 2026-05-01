# 02. Players

## Goal

Add player-domain endpoints for player profiles, game logs, search/info, skater stats, goalie stats, leaders, milestones, and player spotlight data.

## Endpoint Coverage

- Web API player landing.
- Web API player game logs.
- Stats API player search.
- Stats API player information.
- Skater stats, leaders, and milestones.
- Goalie stats, leaders, and milestones.
- Player spotlight.

## Public SDK Surface

- `client.players.getLanding(playerId, options?)`
- `client.players.getGameLog(playerId, params)`
- `client.players.search(params)`
- `client.players.getInfo(playerId, options?)`
- `client.players.getSkaterStats(params)`
- `client.players.getGoalieStats(params)`
- `client.players.getSkaterLeaders(params)`
- `client.players.getGoalieLeaders(params)`
- `client.players.getMilestones(params)`
- `client.players.getSpotlight(params?)`

Export player response schemas, query parameter types, and inferred result types.

## Zod/Schema Notes

- Model player identity, team, position, handedness, headshot/hero image URLs, season totals, and career totals.
- Keep skater and goalie stat schemas separate where fields diverge.
- Represent localized name fields consistently with shared name schemas.
- Validate IDs and season values at the SDK boundary when practical.

## Test Plan

- Fixture-parse player landing and game log responses.
- Fixture-parse player search and info responses.
- Fixture-parse skater and goalie stats/leaders/milestones.
- Verify query construction for season, game type, team, position, limit, and sort options.
- Verify methods use the correct Web API or Stats API base URL.

## Acceptance Criteria

- All player methods return Zod-validated typed data.
- Fixtures cover at least one active skater and one goalie.
- Stats API filters are generated deterministically.
- Public exports are available from the package entrypoint.

