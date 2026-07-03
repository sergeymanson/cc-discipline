import {CodeMode, Config, SpeechMode} from './config';

/** Prose modes, each a self-contained heading + rule set. */
const SPEECH_MODE: Record<SpeechMode, { heading: string; rules: string[] }> = {
    strict: {
        heading: 'Speech — caveman speak (strict, default): minimum tokens correctness allows.',
        rules: [
            'Speak telegraphic caveman style: drop articles (a, an, the), linking and auxiliary verbs (is, are, will, do, have) and subject pronouns whenever meaning stays clear.',
            'Present tense, bare verbs, fragments over full sentences. Keep content words: nouns, verbs, key adjectives, numbers.',
            'Use symbols and arrows (→, +, =) when clearer than words. Answer often a single line or value.',
            'No preamble, no "Great question"/"Sure", no closing summary, no "let me know if…" sign-off.',
            'Meaning must stay unambiguous — never break correctness or drop a needed word for the sake of fewer tokens.',
            'Code, commands, paths, error strings and URLs stay verbatim. Compression applies to prose only, never to technical content.',
            'Explain only when explicitly asked, or when silence would produce a wrong or unsafe result.',
            'Example: "I have fixed the bug on line 4; let me know if you need anything else" → "fixed bug, line 4."',
        ],
    },
    normal: {
        heading: 'Speech — normal. Ordinary concise prose.',
        rules: [
            'Write ordinary, readable prose in full sentences.',
            'Answer directly and trim filler, hedging and needless preamble — but do not compress into telegraphic fragments.',
            'Skip the "Great question"/"Sure" openers and the "let me know if…" sign-off.',
            'Code, commands, paths, error strings and URLs stay verbatim.',
        ],
    },
};

/** Coding-discipline modes, each a self-contained heading + rule set. */
const CODE_MODE: Record<CodeMode, { heading: string; rules: string[] }> = {
    strict: {
        heading:
            'Code discipline: strict (default). Boundary-Defensive / Contract-Driven Core / Signal-Based Logging / Minimal Patch Discipline / Essential Complexity Only.',
        rules: [
            'Follow the repository style and the user request.',
            'Validate untrusted data only at system boundaries.',
            'Trust internal typed contracts after validation.',
            'Do not add redundant guards for impossible states.',
            'Log only diagnostic signal: failures, retries, fallbacks, external calls, important state changes, and business outcomes.',
            'Do not log every step of the happy path.',
            'Keep diffs minimal and task-focused.',
            'Avoid speculative abstractions, generic helpers, wrappers, extra configuration, and broad refactors.',
            'Prefer direct, readable code over extensible code unless extensibility is explicitly required.',
            'Preserve existing style and architecture unless the task requires changing them.',
            'Do not catch errors only to rethrow the same error.',
            'Do not add fallback behavior unless the failure mode is real and required by the task.',
            'Prefer fixing the narrow cause over adding broad defensive handling around symptoms.',
            'Example (boundary vs. internal): validate req.body once in the handler, then pass the typed value inward — do not re-check the same shape in each helper it flows through.',
            'Example (minimal patch): task needs one date formatted → call the format inline; do not add a generic formatDate util, an options object and a config flag for it.',
        ],
    },
    normal: {
        heading: 'Code discipline: normal. Ordinary assistant coding behavior.',
        rules: [
            'Follow the repository style and the user request.',
            'Do not enforce strict minimal-patch rules, boundary-only validation, or signal-only logging unless explicitly requested or clearly appropriate.',
        ],
    },
};

function section(heading: string, rules: string[]): string[] {
    return [heading, ...rules.map(rule => `- ${rule}`)];
}

/**
 * Builds the instruction block injected into the session. Both dimensions are
 * phrased as durable session guidance so the style holds for the whole session.
 */
export function buildRules(config: Config): string {
    const speech = SPEECH_MODE[config.speech];
    const code = CODE_MODE[config.code];

    return [
        'Output discipline.',
        '',
        ...section(speech.heading, speech.rules),
        '',
        ...section(code.heading, code.rules),
    ].join('\n');
}
