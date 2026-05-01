# 01. SDK Foundation

## Goal

Create the reusable `packages/nhl-api` package and the shared client infrastructure used by every endpoint section.

## Endpoint Coverage

No hockey endpoints are implemented in this section. This slice establishes the request, parsing, and test infrastructure needed by later sections.

## Public SDK Surface

- `createNhlApiClient(options)` factory.
- `NhlApiClient` class or equivalent typed client object.
- Shared request helpers for Web API, Stats API, and NHL Edge hosts.
- `NhlApiError` for non-2xx responses, invalid JSON, timeouts, and validation failures.
- Shared query serialization, including Stats API `cayenneExp` helpers.
- Shared Zod parser helper that returns typed data or throws a typed SDK error.
- Package entrypoint exporting public client APIs, schemas, and inferred types.

## Package Structure

- `packages/nhl-api/package.json`
- `packages/nhl-api/tsconfig.json`
- `packages/nhl-api/src/index.ts`
- `packages/nhl-api/src/client.ts`
- `packages/nhl-api/src/errors.ts`
- `packages/nhl-api/src/http.ts`
- `packages/nhl-api/src/schemas/`
- `packages/nhl-api/src/domains/`
- `packages/nhl-api/test/`
- `packages/nhl-api/test/fixtures/`

Add root workspace wiring for `packages/*` only if the repository does not already include it.

## Zod/Schema Notes

- Keep shared schemas minimal and reusable: locale strings, season IDs, team abbreviations, game IDs, pagination wrappers, and common Stats API wrappers.
- Parse all JSON responses through Zod before returning from public methods.
- Preserve unknown upstream fields only when a domain schema intentionally uses passthrough behavior.
- Include enough validation detail in thrown errors to diagnose the failing endpoint and schema path.

## Test Plan

- Verify base URL selection for Web API, Stats API, and NHL Edge requests.
- Verify path parameter interpolation and URL encoding.
- Verify query parameter serialization for arrays, booleans, dates, pagination, and omitted undefined values.
- Verify Stats API `cayenneExp` generation.
- Verify configurable `fetch`, timeout, headers, and abort behavior.
- Verify non-2xx responses, invalid JSON, and Zod validation errors.
- Verify package build and public exports.

## Acceptance Criteria

- `packages/nhl-api` builds as a TypeScript package.
- Client construction accepts custom `fetch`, base URLs, default headers, and timeout options.
- Shared errors are typed and covered by tests.
- Later domain sections can add methods without changing the foundation API shape.

