const SPECIAL = new Set(['.', '+', '^', '$', '{', '}', '(', ')', '|', '[', ']', '\\']);

export function matchGlob(filePath: string, glob: string): boolean {
  let pattern = '';
  let i = 0;

  while (i < glob.length) {
    if (glob[i] === '*' && glob[i + 1] === '*' && glob[i + 2] === '/') {
      // **/ — matches any path prefix including none
      pattern += '(?:.+/)?';
      i += 3;
    } else if (glob[i] === '*' && glob[i + 1] === '*') {
      // ** at end — matches anything (including path separators)
      pattern += '.*';
      i += 2;
    } else if (glob[i] === '*') {
      // * — matches anything within a single path segment
      pattern += '[^/]*';
      i += 1;
    } else if (glob[i] === '?') {
      pattern += '[^/]';
      i += 1;
    } else if (SPECIAL.has(glob[i])) {
      pattern += '\\' + glob[i];
      i += 1;
    } else {
      pattern += glob[i];
      i += 1;
    }
  }

  return new RegExp(`^${pattern}$`).test(filePath);
}

export function matchesAny(filePath: string, globs: string[]): boolean {
  return globs.some((glob) => matchGlob(filePath, glob));
}
