#!/usr/bin/env node
import {SessionStartInput, SessionStartOutput} from './types';
import {readConfig} from './config';
import {buildRules} from './rules';

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }

  return Buffer.concat(chunks).toString('utf8');
}

async function main(): Promise<void> {
  // The stdin payload is accepted for forward compatibility, but the rules we
  // inject do not depend on it — so a malformed or empty payload is harmless.
  try {
    (JSON.parse(await readStdin()) as SessionStartInput);
  } catch {
    // ignore: still emit the rules below
  }

  const {enabled, level} = readConfig(process.env);
  if (!enabled) {
    return;
  }

  const output: SessionStartOutput = {
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: buildRules(level),
    },
  };

  process.stdout.write(JSON.stringify(output) + '\n');
}

void main();
