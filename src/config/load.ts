import { readFileSync, existsSync } from 'fs';
import { load } from 'js-yaml';
import { ConfigSchema } from './schema';
import type { Config } from './schema';

export function loadConfig(configPath: string): Config {
  if (!existsSync(configPath)) {
    return ConfigSchema.parse({ version: 1 });
  }

  const raw = readFileSync(configPath, 'utf8');
  const parsed = load(raw);
  return ConfigSchema.parse(parsed);
}
