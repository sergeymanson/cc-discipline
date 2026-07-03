export type SpeechMode = 'strict' | 'normal';
export type CodeMode = 'strict' | 'normal';

const SPEECH_MODES: readonly SpeechMode[] = ['strict', 'normal'];
const CODE_MODES: readonly CodeMode[] = ['strict', 'normal'];

/** The two independently-tunable dimensions plus the on/off state. */
export interface Config {
  enabled: boolean;
  /** Caveman-speak mode for prose. */
  speech: SpeechMode;
  /** Coding-discipline mode. */
  code: CodeMode;
}

const DEFAULT_SPEECH: SpeechMode = 'strict';
const DEFAULT_CODE: CodeMode = 'strict';

/**
 * Resolves a flag to an allowed value, falling back to `fallback` on a missing
 * or unrecognised value. An unrecognised value (typo) is reported on stderr so
 * it surfaces in Claude Code's hook debug output without touching stdout.
 */
function resolve<T extends string>(
  allowed: readonly T[],
  fallback: T,
  flag: string,
  raw: string | undefined,
): T {
  if (raw === undefined) {
    return fallback;
  }
  const value = raw.trim().toLowerCase();
  if ((allowed as readonly string[]).includes(value)) {
    return value as T;
  }
  process.stderr.write(`cc-discipline: unknown --${flag} "${raw}", using ${fallback}\n`);
  return fallback;
}

/**
 * Pulls a flag value from argv, accepting both `--speech strict` and
 * `--speech=strict` forms. Returns the last occurrence so a later flag wins.
 */
function readFlag(argv: readonly string[], name: string): string | undefined {
  let found: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === `--${name}`) {
      found = argv[i + 1];
    } else if (arg.startsWith(`--${name}=`)) {
      found = arg.slice(name.length + 3);
    }
  }
  return found;
}

/**
 * Reads runtime configuration.
 *
 * - `CC_DISCIPLINE=0` (or `false`/`off`) disables the hook entirely; it emits
 *   nothing and the session runs untouched.
 * - `--speech <strict|normal>` selects the prose mode (default `strict`).
 * - `--code <strict|normal>` selects the coding-discipline mode (default
 *   `strict`).
 *
 * Unknown or missing values fall back to the default.
 */
export function readConfig(env: NodeJS.ProcessEnv, argv: readonly string[]): Config {
  const flag = (env.CC_DISCIPLINE ?? '').trim().toLowerCase();
  const enabled = !(flag === '0' || flag === 'false' || flag === 'off');

  const speech = resolve(SPEECH_MODES, DEFAULT_SPEECH, 'speech', readFlag(argv, 'speech'));
  const code = resolve(CODE_MODES, DEFAULT_CODE, 'code', readFlag(argv, 'code'));

  return {enabled, speech, code};
}
