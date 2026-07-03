# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@dartchuk-s/cc-discipline` is a Claude Code `SessionStart` hook, distributed as an npm package with
a `bin` (`dist/index.js`). Claude Code runs it once per session; it prints a single JSON object whose
`additionalContext` is merged into the session context. That injected text sets two independent
disciplines for the rest of the session: **speech** (terse "caveman speak" prose) and **code**
(strict coding discipline). There is no runtime, server, or persistent state — one stdin→stdout pass.

## Commands

```bash
npm run build       # tsc -> dist/ (CommonJS, declarations)
npm run typecheck   # tsc --noEmit
npm test            # build, then node --test over test/

# run a single test file (build first — tests import from dist/, not src/)
npm run build && node --test test/config.test.js

# smoke-test the hook output directly
echo '{}' | node dist/index.js --speech normal --code strict
```

Node >= 24 is required (built-in test runner, `for await` on stdin).

## Architecture

Data flows in one direction through three small modules under `src/`:

- **`index.ts`** — the bin entry (`#!/usr/bin/env node`). Reads stdin (the session payload is parsed
  only for forward-compat and is *not* used to build the rules — a malformed/empty payload is
  harmless), calls `readConfig(process.env, process.argv.slice(2))`, and if enabled writes
  `buildRules(config)` wrapped in the `SessionStartOutput` shape to stdout.
- **`config.ts`** — `readConfig` turns env + argv into `Config {enabled, speech, code}`. `SpeechMode`
  and `CodeMode` are both `'strict' | 'normal'`, defaulting to `strict`. `resolve()` reports an
  unknown flag value on **stderr** and falls back to the default.
- **`rules.ts`** — `SPEECH_MODE` and `CODE_MODE` are `Record<Mode, {heading, rules}>` tables;
  `buildRules` concatenates the two selected sections into the injected text block. Editing the
  actual guidance the agent receives means editing these tables.

### Non-obvious constraints

- **Configuration is CLI flags, not hook-object fields.** Claude Code does not forward custom keys
  from a hook's settings.json object to the command, so options are passed as `--speech`/`--code`
  flags baked into the hook `command`. On/off is the `CC_DISCIPLINE` env var (`0`/`false`/`off`
  disables). Do not "fix" this by reading custom stdin fields — they don't arrive.
- **stdout is a strict contract.** Only the single JSON object may go to stdout; all diagnostics
  (e.g. the unknown-flag warning) go to stderr, which Claude Code surfaces in hook debug output.
- **Tests run against `dist/`, not `src/`.** `test/*.test.js` are plain CommonJS requiring
  `../dist/*.js`, kept out of `tsconfig`'s `src` rootDir so they are neither compiled nor published
  (`files` ships only `dist`). Always build before running a test in isolation.
- The two modes must stay symmetric across the codebase: adding/renaming a mode touches the type in
  `config.ts`, its table entry in `rules.ts`, and the Levels section of `README.md`.

## Publishing

Releases are automated via `.github/workflows/publish.yml`, triggered by a GitHub **Release**
(`release: published`). It publishes over **OIDC trusted publishing** (no `NPM_TOKEN`) with automatic
provenance. `.github/workflows/ci.yml` runs typecheck + build on push/PR (note: it does **not** run
`npm test`). To cut a release: bump `version` in `package.json`, push, then create a matching GitHub
Release.
