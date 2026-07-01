export type Level = 'lite' | 'standard' | 'strict';

const LEVELS: readonly Level[] = ['lite', 'standard', 'strict'];

/**
 * Reads runtime configuration from the environment.
 *
 * - `CC_DISCIPLINE=0` (or `false`/`off`) disables the hook entirely; it emits
 *   nothing and the session runs untouched.
 * - `CC_DISCIPLINE_LEVEL` picks how aggressive the concision rules are:
 *   `lite`, `standard` (default) or `strict`. Unknown values fall back to
 *   `standard`.
 */
export function readConfig(env: NodeJS.ProcessEnv): {enabled: boolean; level: Level} {
  const flag = (env.CC_DISCIPLINE ?? '').trim().toLowerCase();
  const enabled = !(flag === '0' || flag === 'false' || flag === 'off');

  const raw = (env.CC_DISCIPLINE_LEVEL ?? '').trim().toLowerCase();
  const level = (LEVELS as readonly string[]).includes(raw) ? (raw as Level) : 'standard';

  return {enabled, level};
}
