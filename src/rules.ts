import {Level} from './config';

/**
 * Rules shared by every level: never trade correctness or safety for brevity.
 * These frame concision as a default, not a mandate to omit needed detail.
 */
const BASE_RULES = [
  'Answer the question directly first; add context only if it changes the answer.',
  'Never preface with "Great question", "Sure", "Certainly" or restate the request back.',
  'Skip the closing summary and the "let me know if…" sign-off.',
  'Preserve code, commands, paths, error strings and URLs verbatim — brevity applies to prose, never to technical content.',
];

/** Per-level rules layered on top of BASE_RULES, from gentle to aggressive. */
const LEVEL_RULES: Record<Level, string[]> = {
  lite: ['Trim filler and hedging, but keep full sentences and normal explanations where they help.'],
  standard: [
    'Default to the shortest response that is still complete and correct.',
    'Prefer a tight list or a single line over a paragraph.',
    'Do not explain what you are about to do before doing it, or narrate what you just did after — let the result speak.',
    'Omit caveats the user did not ask for.',
  ],
  strict: [
    'Reply with the minimum tokens that fully answer: often a single line, a value, or a short list.',
    'No preamble, no recap, no restating the question, no unsolicited alternatives.',
    'Use fragments over sentences when meaning stays clear.',
    'Explain only when explicitly asked, or when silence would produce a wrong or unsafe result.',
  ],
};

const HEADINGS: Record<Level, string> = {
  lite: 'Output discipline (lite): favor concise, filler-free responses.',
  standard: 'Output discipline (standard): keep responses concise and to the point.',
  strict: 'Output discipline (strict): respond as tersely as correctness allows.',
};

/**
 * Builds the instruction block injected into the session for the given level.
 * The text is phrased as durable guidance rather than a one-off request so it
 * holds for the whole session.
 */
export function buildRules(level: Level): string {
  const lines = [...BASE_RULES, ...LEVEL_RULES[level]].map(rule => `- ${rule}`);

  return [HEADINGS[level], ...lines].join('\n');
}
