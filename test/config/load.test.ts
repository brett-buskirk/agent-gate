import { describe, it, expect } from 'vitest';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { loadConfig } from '../../src/config/load';

const TMP = join(__dirname, '.tmp-agentgate.yml');

describe('loadConfig', () => {
  it('returns defaults when config file does not exist', () => {
    const config = loadConfig('/nonexistent/.agentgate.yml');
    expect(config.version).toBe(1);
    expect(config.fail_on).toBe('error');
    expect(config.rules.secrets.enabled).toBe(true);
  });

  it('loads and merges a config file', () => {
    writeFileSync(
      TMP,
      `version: 1\nfail_on: warning\nrules:\n  secrets:\n    enabled: false\n`,
    );
    try {
      const config = loadConfig(TMP);
      expect(config.fail_on).toBe('warning');
      expect(config.rules.secrets.enabled).toBe(false);
      expect(config.rules.scope.enabled).toBe(true);
    } finally {
      unlinkSync(TMP);
    }
  });
});
