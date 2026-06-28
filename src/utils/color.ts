/**
 * Decide whether ANSI color should be emitted. Honors the `NO_COLOR` and
 * `FORCE_COLOR` conventions, then falls back to TTY detection.
 */
export function colorEnabled(
  env: NodeJS.ProcessEnv = process.env,
  stream: { isTTY?: boolean } = process.stdout,
): boolean {
  if (env['NO_COLOR']) return false;
  const force = env['FORCE_COLOR'];
  if (force !== undefined) return force !== '0';
  return stream.isTTY === true;
}

const enabled = colorEnabled();

function wrap(code: number, s: string): string {
  return enabled ? `\x1b[${code}m${s}\x1b[0m` : s;
}

export const c = {
  green: (s: string) => wrap(32, s),
  yellow: (s: string) => wrap(33, s),
  red: (s: string) => wrap(31, s),
  cyan: (s: string) => wrap(36, s),
  bold: (s: string) => wrap(1, s),
  dim: (s: string) => wrap(2, s),
};
