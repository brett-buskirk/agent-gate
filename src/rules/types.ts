import type { DiffModel } from '../diff/parse';
import type { Config } from '../config/schema';

export type { DiffModel, DiffFile, DiffChunk, DiffLine } from '../diff/parse';

export type Severity = 'error' | 'warning' | 'info';

export interface Finding {
  ruleId: string;
  severity: Severity;
  file?: string;
  line?: number;
  message: string;
  suggestion?: string;
}

export interface Rule {
  id: string;
  description: string;
  run(diff: DiffModel, config: Config): Finding[];
}
