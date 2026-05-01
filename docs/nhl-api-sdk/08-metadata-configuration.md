# 08. Metadata and Configuration

## Goal

Add metadata and configuration endpoints for API health, shared lookup data, game/location metadata, postal lookup, glossary data, and content modules.

## Endpoint Coverage

- Meta information.
- Game metadata.
- Location metadata.
- Postal lookup.
- Stats API configuration.
- Stats API ping.
- Stats API country information.
- Stats API glossary.
- Stats API content module.

## Public SDK Surface

- `client.metadata.getMeta(params?)`
- `client.metadata.getGameMetadata(params?)`
- `client.metadata.getLocationMetadata(params?)`
- `client.metadata.lookupPostalCode(params)`
- `client.config.getStatsConfiguration(params?)`
- `client.config.ping()`
- `client.config.getCountries(params?)`
- `client.config.getGlossary(params?)`
- `client.config.getContentModule(params)`

Export metadata/config response schemas, query parameter types, and inferred result types.

## Zod/Schema Notes

- Keep lookup schemas small and explicit: countries, provinces/states, cities, venues, glossary terms, and content modules.
- Use passthrough sparingly for configuration payloads that may expose dynamic endpoint metadata.
- Validate required lookup parameters such as postal code, country, locale, and module keys.
- Keep health/ping response handling tolerant of minimal responses.

## Test Plan

- Fixture-parse meta, game metadata, location metadata, and postal lookup responses.
- Fixture-parse Stats API configuration, country, glossary, and content module responses.
- Verify ping handling for empty or minimal responses.
- Verify query construction for locale, country, postal code, and module filters.

## Acceptance Criteria

- Metadata methods are grouped under `client.metadata`.
- Configuration methods are grouped under `client.config`.
- Tests cover both data lookups and health/configuration endpoints.
- Public schemas and types are exported from the package entrypoint.

