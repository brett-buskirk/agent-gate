export interface DiffLine {
  type: 'add' | 'del' | 'normal';
  content: string;
  lineNumber?: number;
}

export interface DiffChunk {
  lines: DiffLine[];
}

export interface DiffFile {
  path: string;
  oldPath: string | null;
  added: number;
  deleted: number;
  isNew: boolean;
  isDeleted: boolean;
  chunks: DiffChunk[];
}

export interface DiffModel {
  files: DiffFile[];
  totalAdded: number;
  totalDeleted: number;
}

const HUNK_HEADER = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/;

export function parsePatch(patch: string): DiffModel {
  const files: DiffFile[] = [];
  let current: DiffFile | null = null;
  let currentChunk: DiffChunk | null = null;
  let lineNum = 0;

  for (const line of patch.split('\n')) {
    if (line.startsWith('diff --git ')) {
      if (current) files.push(current);
      current = { path: '', oldPath: null, added: 0, deleted: 0, isNew: false, isDeleted: false, chunks: [] };
      currentChunk = null;
    } else if (line.startsWith('--- ')) {
      if (!current) continue;
      const p = line.slice(4);
      current.oldPath = p === '/dev/null' ? null : p.replace(/^a\//, '');
      if (p === '/dev/null') current.isNew = true;
    } else if (line.startsWith('+++ ')) {
      if (!current) continue;
      const p = line.slice(4);
      if (p === '/dev/null') {
        current.isDeleted = true;
      } else {
        current.path = p.replace(/^b\//, '');
      }
    } else if (HUNK_HEADER.test(line)) {
      if (!current) continue;
      const match = HUNK_HEADER.exec(line)!;
      lineNum = parseInt(match[1], 10) - 1;
      currentChunk = { lines: [] };
      current.chunks.push(currentChunk);
    } else if (currentChunk && current) {
      if (line.startsWith('+')) {
        lineNum++;
        currentChunk.lines.push({ type: 'add', content: line.slice(1), lineNumber: lineNum });
        current.added++;
      } else if (line.startsWith('-')) {
        currentChunk.lines.push({ type: 'del', content: line.slice(1) });
        current.deleted++;
      } else if (line.startsWith(' ')) {
        lineNum++;
        currentChunk.lines.push({ type: 'normal', content: line.slice(1), lineNumber: lineNum });
      }
    }
  }

  if (current) files.push(current);

  const totalAdded = files.reduce((a, f) => a + f.added, 0);
  const totalDeleted = files.reduce((a, f) => a + f.deleted, 0);

  return { files, totalAdded, totalDeleted };
}
