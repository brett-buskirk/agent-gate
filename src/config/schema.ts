import { z } from 'zod';

const SeveritySchema = z.enum(['error', 'warning', 'info']);

export const ConfigSchema = z.object({
  version: z.literal(1),
  fail_on: z.enum(['error', 'warning', 'never']).default('error'),
  comment: z.boolean().default(true),
  rules: z
    .object({
      secrets: z
        .object({
          enabled: z.boolean().default(true),
          severity: SeveritySchema.default('error'),
        })
        .default({}),
      scope: z
        .object({
          enabled: z.boolean().default(true),
          severity: SeveritySchema.default('error'),
          allow: z.array(z.string()).optional(),
          deny: z
            .array(z.string())
            .default(['.github/workflows/**', 'infra/**', '**/*.lock', 'package-lock.json']),
        })
        .default({}),
      diff_size: z
        .object({
          enabled: z.boolean().default(true),
          severity: SeveritySchema.default('warning'),
          max_files: z.number().int().positive().default(30),
          max_lines: z.number().int().positive().default(800),
        })
        .default({}),
      tests_required: z
        .object({
          enabled: z.boolean().default(true),
          severity: SeveritySchema.default('warning'),
          src_globs: z.array(z.string()).default(['src/**']),
          test_globs: z
            .array(z.string())
            .default(['**/*.test.*', '**/*.spec.*', 'tests/**']),
        })
        .default({}),
      dependencies: z
        .object({
          enabled: z.boolean().default(true),
          severity: SeveritySchema.default('warning'),
          manifests: z
            .array(z.string())
            .default(['package.json', 'requirements.txt', 'go.mod', 'Gemfile', 'Cargo.toml']),
        })
        .default({}),
      dangerous_patterns: z
        .object({
          enabled: z.boolean().default(true),
          severity: SeveritySchema.default('error'),
          patterns: z
            .array(z.string())
            .default(['eval\\(', '--no-verify', 'child_process\\.exec\\(']),
        })
        .default({}),
      intent: z
        .object({
          enabled: z.boolean().default(false),
          severity: SeveritySchema.default('warning'),
          model: z.string().default('claude-haiku-4-5-20251001'),
          max_diff_bytes: z.number().int().positive().default(60000),
        })
        .default({}),
    })
    .default({}),
});

export type Config = z.infer<typeof ConfigSchema>;
