# NHL API Tooling Plan

## Goal

Puckwise should support broad NHL data access without exposing the model to the complexity of ~100 raw NHL API endpoints.

The assistant should reason in hockey concepts like players, teams, games, standings, schedules, leaders, and stats — not raw URL paths, query strings, or `cayenneExp` syntax.

## Decision

Use a hybrid architecture:

```txt
NHL API endpoints
  ↓
typed internal endpoint registry/client
  ↓
domain services
  ↓
small curated set of AI-facing tools
```

Do **not** create one AI tool per NHL API endpoint.

Do **not** expose a raw generic tool like:

```ts
nhlApi({ endpoint: "/v1/gamecenter/2023020204/boxscore" })
```

That would make the model responsible for endpoint discovery, path formatting, query syntax, response interpretation, API quirks, and safe filtering. It would likely hallucinate paths and overfetch data.

Instead, expose a small set of semantic tools backed by an internal NHL API client.

---

## Why Not 100 Tools?

One tool per endpoint would create several problems:

- Too many tools for the model to choose from reliably.
- Lots of duplicate input shapes: season, game type, team, date, player ID, game ID.
- More prompting overhead.
- More maintenance when endpoint behavior changes.
- Many endpoints are implementation details, not user intents.

The model should not need separate tools for:

- `GET /v1/score/now`
- `GET /v1/score/{date}`
- `GET /v1/schedule/now`
- `GET /v1/schedule/{date}`

Those can all sit behind a single higher-level `getNhlGames` tool.

---

## Why Not One Raw Generic Tool?

A generic endpoint tool is flexible but unsafe and brittle:

```ts
callNhlApi({
  base: "web",
  path: "/v1/player/8478402/landing",
  query: {}
})
```

Problems:

- The model must know undocumented NHL endpoint paths.
- The model may invent endpoints or unsupported query params.
- Raw responses may be huge.
- The model must understand NHL-specific conventions like:
  - `season` format: `20232024`
  - `gameTypeId`: `2` regular season, `3` playoffs
  - stats API `cayenneExp`
  - web API vs stats API split
- Hard to validate and normalize results.

A raw generic client can exist internally, but it should not be AI-facing.

---

## Recommended Architecture

### 1. HTTP Layer

Responsible for shared fetch behavior.

Suggested file:

```txt
src/lib/nhl/http.ts
```

Responsibilities:

- base URL selection
- timeout handling
- response status errors
- optional retries
- cache TTL hooks
- JSON parsing
- consistent error messages

Current logic in `src/lib/nhl-api.ts` can migrate here over time.

---

### 2. Endpoint Registry

A typed internal map of supported NHL endpoints.

Suggested file:

```txt
src/lib/nhl/endpoints.ts
```

Example:

```ts
const nhlEndpoints = {
  playerLanding: {
    base: "web",
    path: ({ playerId }: { playerId: number }) =>
      `/v1/player/${playerId}/landing`,
    ttlMs: 60 * 60 * 1000,
  },
  gameBoxscore: {
    base: "web",
    path: ({ gameId }: { gameId: number }) =>
      `/v1/gamecenter/${gameId}/boxscore`,
    ttlMs: 30 * 1000,
  },
  standingsNow: {
    base: "web",
    path: () => "/v1/standings/now",
    ttlMs: 5 * 60 * 1000,
  },
}
```

The registry lets us support many NHL endpoints internally without exposing each endpoint as a tool.

---

### 3. Query Builder for NHL Stats API

Suggested file:

```txt
src/lib/nhl/query-builder.ts
```

The stats API uses `cayenneExp`, which should not be generated directly by the LLM.

Instead, expose safe structured filters and build `cayenneExp` internally.

Example public input:

```ts
{
  season: 20232024,
  gameType: 2,
  teamId: 30,
  positionCode: "C"
}
```

Internal output:

```txt
seasonId=20232024 and gameTypeId=2 and currentTeamId=30 and positionCode="C"
```

---

### 4. Domain Services

Domain services compose raw endpoints into hockey concepts.

Suggested files:

```txt
src/lib/nhl/services/player-service.ts
src/lib/nhl/services/team-service.ts
src/lib/nhl/services/game-service.ts
src/lib/nhl/services/stats-service.ts
src/lib/nhl/services/standings-service.ts
```

Responsibilities:

- choose the correct endpoint(s)
- normalize NHL responses
- filter oversized data
- provide stable result shapes to tools
- hide API differences between `api-web.nhle.com` and `api.nhle.com/stats/rest`

---

### 5. AI-Facing Tools

Suggested file:

```txt
src/lib/nhl/tools.ts
```

Expose only semantic, user-intent-oriented tools.

Initial target tool set:

```ts
[
  searchNhlPlayers,
  getNhlPlayer,
  getNhlTeam,
  getNhlStandings,
  getNhlGames,
  getNhlGame,
  getNhlLeaders,
  queryNhlStats,
]
```

This should cover most user questions without creating tool sprawl.

---

## Proposed AI Tools

### 1. `searchNhlPlayers`

Status: already exists.

Purpose: resolve a player name to NHL player IDs.

Backed by:

```txt
/stats/rest/en/players
```

Input:

```ts
{
  lastName: string
}
```

Notes:

- Keep this simple.
- It is useful as the first step before player-specific tools.

---

### 2. `getNhlPlayer`

Upgrade/replacement for current `getNhlPlayerLanding`.

Purpose: fetch profile, season totals, game logs, and optional NHL Edge player data.

Input:

```ts
{
  playerId: number
  season?: number
  gameType?: 2 | 3
  include?: Array<"profile" | "seasonTotals" | "gameLog" | "edge">
}
```

Backed by:

```txt
/v1/player/{player}/landing
/v1/player/{player}/game-log/{season}/{gameType}
/v1/player/{player}/game-log/now
/v1/edge/skater-detail/{player}/...
/v1/edge/goalie-detail/{player}/...
```

Default behavior:

- Include profile and season totals.
- Do not include full game logs unless requested.
- Use `gameType = 2` for regular season unless the user asks for playoffs.

---

### 3. `getNhlTeam`

Purpose: fetch team roster, stats, schedule, scoreboard, or prospects.

Input:

```ts
{
  team: string
  season?: number
  gameType?: 2 | 3
  include?: Array<"roster" | "stats" | "schedule" | "scoreboard" | "prospects">
}
```

Backed by:

```txt
/v1/roster/{team}/current
/v1/roster/{team}/{season}
/v1/club-stats/{team}/now
/v1/club-stats/{team}/{season}/{gameType}
/v1/club-schedule-season/{team}/now
/v1/club-schedule-season/{team}/{season}
/v1/scoreboard/{team}/now
/v1/prospects/{team}
```

Default behavior:

- Current roster for roster questions.
- Current stats for “this season” questions.
- Explicit season when user asks historical questions.

---

### 4. `getNhlStandings`

Purpose: fetch current or date-specific standings.

Input:

```ts
{
  date?: string
}
```

Backed by:

```txt
/v1/standings/now
/v1/standings/{date}
```

Notes:

- `date` should use `YYYY-MM-DD`.
- Current standings by default.

---

### 5. `getNhlGames`

Purpose: answer schedule, score, and scoreboard questions for a date or current period.

Input:

```ts
{
  date?: string
  mode?: "scores" | "schedule" | "scoreboard"
}
```

Backed by:

```txt
/v1/score/now
/v1/score/{date}
/v1/schedule/now
/v1/schedule/{date}
/v1/scoreboard/now
```

Default behavior:

- If user asks “scores”, use scores.
- If user asks “games today”, scores or scoreboard may be appropriate.
- If user asks future dates, use schedule.

---

### 6. `getNhlGame`

Purpose: fetch details for one game.

Input:

```ts
{
  gameId: number
  include?: Array<"landing" | "boxscore" | "playByPlay" | "story" | "shifts">
}
```

Backed by:

```txt
/v1/gamecenter/{gameId}/landing
/v1/gamecenter/{gameId}/boxscore
/v1/gamecenter/{gameId}/play-by-play
/v1/wsc/game-story/{gameId}
/stats/rest/en/shiftcharts?cayenneExp=gameId={gameId}
```

Default behavior:

- Include landing and boxscore.
- Do not include full play-by-play or shift charts unless requested.
- Summarize or trim large responses before returning to the model.

---

### 7. `getNhlLeaders`

Purpose: answer “who leads the league in X?” questions.

Input:

```ts
{
  playerType: "skater" | "goalie"
  category: string
  season?: number
  gameType?: 2 | 3
  limit?: number
}
```

Backed by:

```txt
/v1/skater-stats-leaders/current
/v1/skater-stats-leaders/{season}/{gameType}
/v1/goalie-stats-leaders/current
/v1/goalie-stats-leaders/{season}/{gameType}
```

Examples:

```ts
getNhlLeaders({ playerType: "skater", category: "goals", limit: 10 })
getNhlLeaders({ playerType: "goalie", category: "wins", season: 20232024, gameType: 2 })
```

---

### 8. `queryNhlStats`

Purpose: flexible structured access to the NHL stats API without exposing raw `cayenneExp`.

Input:

```ts
{
  subject: "skater" | "goalie" | "team"
  report: "summary" | "realtime" | "powerplay" | "penaltyKill"
  season: number
  gameType?: 2 | 3
  filters?: {
    teamId?: number
    playerId?: number
    positionCode?: string
  }
  sort?: string
  dir?: "asc" | "desc"
  limit?: number
}
```

Backed by:

```txt
/stats/rest/en/skater/{report}
/stats/rest/en/goalie/{report}
/stats/rest/en/team/{report}
```

Important rule:

- The tool input should stay structured.
- The service builds `cayenneExp` internally.
- The model should never provide raw `cayenneExp`.

---

## Endpoint Grouping Strategy

### Core first

Prioritize endpoints that answer common assistant questions:

- players
- teams
- standings
- schedules
- scores
- boxscores
- league leaders
- basic stat queries

### Later

Add as product demand emerges:

- NHL Edge data
- playoffs bracket/series
- draft rankings/picks
- TV schedule / where to watch
- odds
- replays
- right rail / WSC content
- postal lookup
- meta endpoints

---

## Suggested Migration Plan

### Phase 1: Keep current tools, add structure

Current files:

```txt
src/lib/nhl-api.ts
src/lib/nhl-tools.ts
```

Actions:

- Keep `searchNhlPlayers`.
- Keep `getNhlPlayerLanding` for now.
- Introduce `src/lib/nhl/http.ts`.
- Introduce `src/lib/nhl/endpoints.ts`.
- Move shared fetch logic from `nhl-api.ts` into the new HTTP layer.

Deliverable:

- No behavior change, cleaner foundation.

---

### Phase 2: Add first semantic tools

Add:

```txt
getNhlStandings
getNhlGames
getNhlGame
getNhlLeaders
```

Update the chat system prompt to describe these tools by user intent.

Deliverable:

- Assistant can answer standings, scores, schedule, game, and leader questions.

---

### Phase 3: Replace player landing with `getNhlPlayer`

Actions:

- Create `player-service.ts`.
- Have `getNhlPlayer` compose profile, totals, game log, and optional edge data.
- Keep `getNhlPlayerLanding` as an internal endpoint method or temporary compatibility export.

Deliverable:

- Player questions route through a more flexible semantic tool.

---

### Phase 4: Add `queryNhlStats`

Actions:

- Create safe stats query builder.
- Support skater, goalie, and team summary queries first.
- Add more reports only after testing API shapes.

Deliverable:

- Assistant can answer more flexible stat-ranking and filtered-stat questions.

---

### Phase 5: Add team service

Actions:

- Create `team-service.ts`.
- Add `getNhlTeam` tool.
- Support roster, stats, schedule, scoreboard, and prospects.

Deliverable:

- Assistant can answer team-specific questions without needing many endpoint-level tools.

---

### Phase 6: Add NHL Edge support later

Do not mix NHL Edge into the first implementation unless needed immediately.

Possible future tools:

```txt
getNhlEdgeLeaders
getNhlPlayerEdge
getNhlTeamEdge
```

Alternatively, expose NHL Edge via `include: ["edge"]` on `getNhlPlayer` and `getNhlTeam`.

---

## Caching Guidance

Suggested TTLs:

| Data type | Suggested TTL |
| --- | ---: |
| player landing/profile | 1-24 hours |
| historical stats | 24 hours |
| current standings | 2-5 minutes |
| current scoreboard | 15-30 seconds |
| live game boxscore | 15-30 seconds |
| play-by-play | 10-30 seconds during live games |
| team roster | 1-6 hours |
| schedules | 5-60 minutes |

Caching should be implemented below the service/tool layer so all callers benefit.

---

## Tool Design Rules

Create a new AI-facing tool when:

- the user intent is meaningfully different
- the input shape is significantly different
- the result needs a different normalized shape
- the tool description helps the model choose correctly

Do **not** create a new AI-facing tool just because the NHL API has a separate endpoint.

---

## Prompting Rules for the Assistant

System prompt should include NHL-specific rules:

- Use tools for current or historical NHL data.
- Do not invent statistics.
- Regular season is `gameTypeId = 2`.
- Playoffs are `gameTypeId = 3`.
- NHL season IDs use `YYYYYYYY`, e.g. `20232024`.
- “Last year” should usually mean the previous completed NHL season.
- Ask a clarifying question for ambiguous player names.
- Ignore non-NHL league rows unless explicitly requested.
- Do not request full play-by-play unless needed.

---

## Initial Implementation Checklist

- [ ] Create `src/lib/nhl/http.ts`.
- [ ] Create `src/lib/nhl/endpoints.ts`.
- [ ] Create `src/lib/nhl/web-client.ts`.
- [ ] Create `src/lib/nhl/stats-client.ts`.
- [ ] Move existing player API calls into the new client structure.
- [ ] Add `getNhlStandings` service/tool.
- [ ] Add `getNhlGames` service/tool.
- [ ] Add `getNhlGame` service/tool.
- [ ] Add `getNhlLeaders` service/tool.
- [ ] Update `src/routes/api/chat.ts` tool list.
- [ ] Update the chat system prompt.
- [ ] Add tests for URL construction and query building.
- [ ] Add tests for service-level normalization.

---

## Final Recommendation

Use **8-ish semantic AI tools** backed by a typed internal NHL client and endpoint registry.

The AI should see:

```txt
search players
get player
get team
get standings
get games
get game
get leaders
query stats
```

The codebase can still support all NHL endpoints internally, but the model should interact with stable hockey-domain tools rather than raw endpoint paths.
