import type { DiffModel } from '../diff/parse';

/**
 * Compact a diff into a bounded text summary for the intent prompt: each file's
 * path with its +/- counts, followed by the lines it adds, truncated to
 * `maxBytes` so a huge PR can't blow up token cost.
 */
export function summarizeDiff(diff: DiffModel, maxBytes: number): string {
  const parts: string[] = [];
  let size = 0;
  let truncated = false;

  outer: for (const file of diff.files) {
    const status = file.isNew ? ' (new file)' : file.isDeleted ? ' (deleted)' : '';
    const header = `\n## ${file.path}${status}  +${file.added} -${file.deleted}`;
    parts.push(header);
    size += header.length;

    for (const chunk of file.chunks) {
      for (const line of chunk.lines) {
        if (line.type !== 'add') continue;
        const text = `\n+ ${line.content}`;
        if (size + text.length > maxBytes) {
          truncated = true;
          break outer;
        }
        parts.push(text);
        size += text.length;
      }
    }
  }

  if (truncated) parts.push('\n\n[diff truncated to fit the size budget]');
  return parts.join('').trim();
}
