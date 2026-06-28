const enabled = process.stdout.isTTY && !process.env['NO_COLOR'];

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
