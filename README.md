# cc-discipline

[![npm](https://img.shields.io/npm/v/@dartchuk-s/cc-discipline)](https://www.npmjs.com/package/@dartchuk-s/cc-discipline)
[![downloads](https://img.shields.io/npm/dm/@dartchuk-s/cc-discipline)](https://www.npmjs.com/package/@dartchuk-s/cc-discipline)
[![license](https://img.shields.io/npm/l/@dartchuk-s/cc-discipline)](./LICENSE)
[![node](https://img.shields.io/node/v/@dartchuk-s/cc-discipline)](https://nodejs.org)
[![install size](https://packagephobia.com/badge?p=@dartchuk-s/cc-discipline)](https://packagephobia.com/result?p=@dartchuk-s/cc-discipline)

A minimal, zero-config [Claude Code](https://claude.com/claude-code) `SessionStart` hook that
injects a compact set of **output-discipline** rules at the start of every session, so the agent
answers concisely and stops burning tokens on filler, preambles and recaps — without you having to
repeat "be brief" in every prompt.

Published on npm: [`@dartchuk-s/cc-discipline`](https://www.npmjs.com/package/@dartchuk-s/cc-discipline).

The hook reads Claude Code's session JSON on stdin and prints a single JSON object that adds the
rules to the session context:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "Output discipline (standard): keep responses concise and to the point.\n- Answer the question directly first; ..."
  }
}
```

## What it enforces

Concision is applied to prose, never to technical content — code, commands, paths, error strings
and URLs are always preserved verbatim, and correctness is never traded for brevity.

- Direct answers first, no "Great question" / "Sure" preambles.
- No closing summaries or "let me know if…" sign-offs.
- Prefer the shortest complete-and-correct response: a line or a tight list over a paragraph.
- No narrating intended actions before or after doing them.

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

Set `CC_DISCIPLINE_LEVEL` to tune how aggressive the rules are (default `standard`):

| Level      | Behaviour                                                                 |
|------------|---------------------------------------------------------------------------|
| `lite`     | Trims filler and hedging; keeps full sentences and normal explanations.   |
| `standard` | Shortest complete answer; lists over paragraphs; no narration or recaps.  |
| `strict`   | Minimum tokens that fully answer; fragments over sentences; no preamble.   |

Set `CC_DISCIPLINE=0` (or `false` / `off`) to disable the hook without removing it from settings —
it emits nothing and the session runs untouched.

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "CC_DISCIPLINE_LEVEL=strict npx -y @dartchuk-s/cc-discipline@latest"
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
echo '{"hook_event_name":"SessionStart","source":"startup"}' | CC_DISCIPLINE_LEVEL=strict node dist/index.js
```

## License

[MIT](./LICENSE)
