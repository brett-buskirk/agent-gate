import { matchesAny } from '../utils/glob';
import type { Rule, Finding } from './types';
import type { DiffModel } from '../diff/parse';
import type { Config } from '../config/schema';

export const testsRequiredRule = {
  id: 'tests_required',
  description: 'Warn if source files changed but no test files were added or modified',

  run(diff: DiffModel, config: Config): Finding[] {
    const { enabled, severity, src_globs, test_globs } = config.rules.tests_required;
    if (!enabled) return [];

    const hasSrcChanges = diff.files.some((f) => matchesAny(f.path, src_globs));
    const hasTestChanges = diff.files.some((f) => matchesAny(f.path, test_globs));

    if (hasSrcChanges && !hasTestChanges) {
      return [
        {
          ruleId: 'tests_required',
          severity,
          message: 'Source files were changed but no test files were added or modified',
          suggestion: 'Add or update tests to cover the changed source code.',
        },
      ];
    }

    return [];
  },
} satisfies Rule;
