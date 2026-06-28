import type { Rule } from './types';
import { secretsRule } from './secrets';
import { scopeRule } from './scope';
import { diffSizeRule } from './diffSize';
import { testsRequiredRule } from './testsRequired';
import { dependenciesRule } from './dependencies';
import { dangerousPatternsRule } from './dangerousPatterns';

export const rules: Rule[] = [
  secretsRule,
  scopeRule,
  diffSizeRule,
  testsRequiredRule,
  dependenciesRule,
  dangerousPatternsRule,
];

export type { Rule, Finding, DiffModel, DiffFile, DiffChunk, DiffLine, Severity } from './types';
