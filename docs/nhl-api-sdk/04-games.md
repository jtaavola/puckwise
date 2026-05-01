# 04. Games

## Goal

Add game-domain endpoints for live and historical game data, including scores, boxscores, play-by-play, stories, metadata, shifts, streams, odds, replays, and WSC play-by-play.

## Endpoint Coverage

- Web API scores.
- Web API scoreboard.
- Web API game landing.
- Web API boxscore.
- Web API play-by-play.
- Web API game story.
- Stats API game information.
- Stats API game metadata.
- Stats API shift charts.
- Streams.
- TV schedule.
- Odds.
- Replays.
- WSC play-by-play.

## Public SDK Surface

- `client.games.getScores(params?)`
- `client.games.getScoreboard(params?)`
- `client.games.getLanding(gameId, options?)`
- `client.games.getBoxscore(gameId, options?)`
- `client.games.getPlayByPlay(gameId, options?)`
- `client.games.getStory(gameId, options?)`
- `client.games.getInfo(params)`
- `client.games.getMetadata(params?)`
- `client.games.getShiftCharts(params)`
- `client.games.getStreams(params)`
- `client.games.getTvSchedule(params?)`
- `client.games.getOdds(params)`
- `client.games.getReplays(params)`
- `client.games.getWscPlayByPlay(params)`

Export game response schemas, query parameter types, and inferred result types.

## Zod/Schema Notes

- Share game ID, season, game type, team summary, venue, broadcast, period, clock, and scoring schemas.
- Keep play-by-play event schemas discriminated where upstream event type fields allow it.
- Represent optional live-game fields defensively because in-progress and final games differ.
- Keep odds, stream, replay, and WSC schemas isolated from core game schemas when their payloads diverge.

## Test Plan

- Fixture-parse scheduled, live, and final game payloads where available.
- Fixture-parse boxscore, play-by-play, game story, and shift chart responses.
- Fixture-parse stream, TV schedule, odds, replay, and WSC responses.
- Verify game ID path construction and date-based score queries.
- Verify validation behavior for incomplete live-game data.

## Acceptance Criteria

- Game-domain methods are grouped under `client.games`.
- Core game schemas are reusable by team and schedule sections without circular imports.
- Fixtures cover at least one final game and one non-final game shape.
- Tests verify Web API, Stats API, and auxiliary game-data endpoints.

