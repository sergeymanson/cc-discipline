/** Payload Claude Code pipes to a SessionStart hook on stdin. */
export interface SessionStartInput {
  session_id?: string;
  transcript_path?: string;
  cwd?: string;
  hook_event_name?: string;
  /** What triggered the session: a fresh start, a resume, a clear or a compaction. */
  source?: 'startup' | 'resume' | 'clear' | 'compact';
}

/** JSON a SessionStart hook prints on stdout to add context to the session. */
export interface SessionStartOutput {
  hookSpecificOutput: {
    hookEventName: 'SessionStart';
    additionalContext: string;
  };
}
