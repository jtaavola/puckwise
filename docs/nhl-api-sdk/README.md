# NHL API SDK Implementation Plan

## Overview

Build a private internal TypeScript SDK in `packages/nhl-api` for NHL Web API, Stats API, and NHL Edge endpoints. The SDK should provide typed client methods, runtime response validation with Zod, checked-in fixtures, and focused tests for request construction and response parsing.

The implementation is split by hockey domain so each section can be delivered independently after the shared foundation exists.

## Reference

- [NHL API Reference](https://github.com/Zmalski/NHL-API-Reference)

## Section Index

- [01. SDK Foundation](./01-sdk-foundation.md)
- [02. Players](./02-players.md)
- [03. Teams](./03-teams.md)
- [04. Games](./04-games.md)
- [05. League Schedule and Seasons](./05-league-schedule-seasons.md)
- [06. Playoffs](./06-playoffs.md)
- [07. Draft](./07-draft.md)
- [08. Metadata and Configuration](./08-metadata-configuration.md)
- [09. NHL Edge](./09-nhl-edge.md)

## Shared Assumptions

- The SDK starts as a private/internal package.
- The package lives at `packages/nhl-api`.
- Runtime validation uses Zod schemas, with exported TypeScript types inferred from those schemas.
- Endpoint work is split by hockey domain, not by upstream API host.
- Each domain owns its schemas, client methods, fixtures, and tests.
