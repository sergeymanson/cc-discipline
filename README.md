# cc-discipline

[![npm](https://img.shields.io/npm/v/@dartchuk-s/cc-discipline)](https://www.npmjs.com/package/@dartchuk-s/cc-discipline)
[![downloads](https://img.shields.io/npm/dm/@dartchuk-s/cc-discipline)](https://www.npmjs.com/package/@dartchuk-s/cc-discipline)
[![license](https://img.shields.io/npm/l/@dartchuk-s/cc-discipline)](./LICENSE)
[![node](https://img.shields.io/node/v/@dartchuk-s/cc-discipline)](https://nodejs.org)
[![install size](https://packagephobia.com/badge?p=@dartchuk-s/cc-discipline)](https://packagephobia.com/result?p=@dartchuk-s/cc-discipline)

A minimal, zero-config [Claude Code](https://claude.com/claude-code) `SessionStart` hook that sets
two disciplines at the start of every session, so you stop repeating "be brief" and "keep it minimal"
in every prompt:

- **Speech** — terse **caveman speak**: telegraphic, function-word-free prose instead of filler,
  preambles and recaps.
- **Code** — strict coding discipline: boundary-only validation, signal-based logging, minimal
  task-focused diffs, no speculative abstraction.

> "I have fixed the bug on line 4; let me know if you need anything else" → "fixed bug, line 4."

Each dimension is a `strict`/`normal` flag (see [Levels](#levels)).

Published on npm: [`@dartchuk-s/cc-discipline`](https://www.npmjs.com/package/@dartchuk-s/cc-discipline).

The hook reads Claude Code's session JSON on stdin and prints a single JSON object that adds the
rules to the session context:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "Output discipline.\n\nSpeech — caveman speak (strict): ...\n- Speak telegraphic caveman style: drop articles ...\n\nCode — laconic (strict): ...\n- Write the minimal code that fully and correctly solves the task ..."
  }
}
```

## What it enforces

Compression applies to prose only, never to technical content — code, commands, paths, error
strings and URLs are always preserved verbatim, and correctness is never traded for brevity.

**Speech (caveman speak):**

- Telegraphic style: drop articles, linking/auxiliary verbs and subject pronouns where meaning stays clear.
- Content words only — nouns, verbs, key adjectives, numbers; fragments over full sentences.
- No "Great question" / "Sure" preambles, no closing summaries or "let me know if…" sign-offs.
- State the result, skip narrating how you got there.

**Code (strict discipline):**

- Validate untrusted data only at boundaries; trust internal typed contracts afterwards.
- Log diagnostic signal only — failures, retries, fallbacks, external calls, state changes — not the happy path.
- Minimal, task-focused diffs; no speculative abstractions, wrappers or broad refactors.
- Preserve existing style and architecture unless the task requires changing them.

## Configure Claude Code

Add a `SessionStart` hook to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "npx -y @dartchuk-s/cc-discipline@latest"
          }
        ]
      }
    ]
  }
}
```

`npx` fetches and caches the package on first run; `@latest` keeps it up to date. The hook fires
once per session and its output is merged into the session context.

## Levels

Two independent dimensions are tuned by CLI flags on the hook command, each defaulting to `strict`:

- `--speech <strict|normal>` — prose mode.
- `--code <strict|normal>` — coding-discipline mode.

Both accept `--flag value` and `--flag=value` forms; unknown values fall back to the default.

**Speech** — how terse prose gets:

| Mode | Behaviour |
|---|---|
| `strict` | Caveman speak: telegraphic, content words only, minimum tokens, often one line. |
| `normal` | Ordinary concise prose in full sentences, just trimmed of filler and preamble. |

**Code** — how disciplined generated code is:

| Mode | Behaviour |
|---|---|
| `strict` | Boundary-only validation, signal-based logging, minimal task-focused diffs, no speculative abstraction. |
| `normal` | Ordinary coding: follow repo style and the request, no strict minimal-patch/boundary/logging rules unless asked. |

Set the levels right in the hook command:

```json
{
  "type": "command",
  "command": "npx -y @dartchuk-s/cc-discipline@latest --speech strict --code normal"
}
```

Omit a flag to keep its default (`strict`). Set `CC_DISCIPLINE=0` (or `false` / `off`) to disable
the hook without removing it from settings — it emits nothing and the session runs untouched.

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "npx -y @dartchuk-s/cc-discipline@latest --speech strict --code strict"
          }
        ]
      }
    ]
  }
}
```

## Requirements

- Node.js >= 24

## Development

```bash
npm install
npm run build        # tsc -> dist/

# smoke test
echo '{"hook_event_name":"SessionStart","source":"startup"}' | node dist/index.js --speech strict --code normal
```

## License

[MIT](./LICENSE)
