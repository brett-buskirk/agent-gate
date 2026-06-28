#!/usr/bin/env node
/**
 * Regenerates the README demo assets from a sample "agent went rogue" diff:
 *   - docs/assets/cli-demo.svg        the colored `agent-gate check` output
 *   - docs/assets/sample-pr-comment.md the exact markdown AgentGate posts on a PR
 *
 * Deterministic and browser-free: the CLI output is captured from the real
 * reporter (with color forced on) and rendered to SVG by a small ANSI parser.
 *
 * Run with `npm run demo` after `npm run build`.
 */
'use strict';

// Force color before requiring anything that reads it at module-load time.
process.env.FORCE_COLOR = '1';
delete process.env.NO_COLOR;

const fs = require('fs');
const path = require('path');
const { parsePatch } = require('../lib/diff/parse');
const { ConfigSchema } = require('../lib/config/schema');
const { runEngine } = require('../lib/engine');
const { reportCli } = require('../lib/report/json');
const { buildBody } = require('../lib/report/comment');

const ROOT = path.join(__dirname, '..');
const ASSETS = path.join(ROOT, 'docs', 'assets');

// --- Run the engine over the sample diff -----------------------------------

const patch = fs.readFileSync(path.join(ROOT, 'test', 'fixtures', 'demo.diff'), 'utf8');
const diff = parsePatch(patch);
const config = ConfigSchema.parse({ version: 1 });
const result = runEngine(diff, config);

// Capture the human CLI output (console.log lines) with color.
const lines = [];
const origLog = console.log;
console.log = (...args) => lines.push(args.join(' '));
try {
  reportCli(result, diff, false);
} finally {
  console.log = origLog;
}
const ansi = lines.join('\n').replace(/^\n+/, '');

// --- ANSI → SVG ------------------------------------------------------------

const COLORS = {
  red: '#f85149',
  green: '#3fb950',
  yellow: '#d29922',
  cyan: '#39c5cf',
  default: '#c9d1d9',
};

function parseAnsi(input) {
  const rows = [[]];
  let fg = null;
  let bold = false;
  let dim = false;
  let buf = '';
  const flush = () => {
    if (buf) {
      rows[rows.length - 1].push({ text: buf, fg, bold, dim });
      buf = '';
    }
  };
  for (let i = 0; i < input.length; ) {
    const ch = input[i];
    if (ch === '\x1b' && input[i + 1] === '[') {
      flush();
      let j = i + 2;
      let code = '';
      while (j < input.length && input[j] !== 'm') code += input[j++];
      for (const part of code.split(';')) {
        const n = parseInt(part, 10);
        if (n === 0) {
          fg = null;
          bold = false;
          dim = false;
        } else if (n === 1) bold = true;
        else if (n === 2) dim = true;
        else if (n === 31) fg = 'red';
        else if (n === 32) fg = 'green';
        else if (n === 33) fg = 'yellow';
        else if (n === 36) fg = 'cyan';
      }
      i = j + 1;
    } else if (ch === '\n') {
      flush();
      rows.push([]);
      i++;
    } else {
      buf += ch;
      i++;
    }
  }
  flush();
  return rows;
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function renderSvg(rows) {
  const charW = 7.8;
  const lineH = 20;
  const padX = 18;
  const padTop = 40; // room for window dots
  const padBottom = 16;
  const maxLen = rows.reduce((m, r) => Math.max(m, r.reduce((a, s) => a + s.text.length, 0)), 0);
  const width = Math.ceil(maxLen * charW) + padX * 2 + 12;
  const height = rows.length * lineH + padTop + padBottom;

  const body = rows
    .map((row, r) => {
      const y = padTop + r * lineH;
      if (row.length === 0) return '';
      const spans = row
        .map((seg) => {
          const fill = COLORS[seg.fg] || COLORS.default;
          const weight = seg.bold ? ' font-weight="700"' : '';
          const opacity = seg.dim ? ' opacity="0.65"' : '';
          return `<tspan fill="${fill}"${weight}${opacity}>${esc(seg.text)}</tspan>`;
        })
        .join('');
      return `<text x="${padX}" y="${y}" xml:space="preserve">${spans}</text>`;
    })
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="13">
  <rect width="${width}" height="${height}" rx="10" fill="#0d1117"/>
  <circle cx="20" cy="20" r="6" fill="#ff5f56"/>
  <circle cx="40" cy="20" r="6" fill="#ffbd2e"/>
  <circle cx="60" cy="20" r="6" fill="#27c93f"/>
  <text x="${width - padX}" y="24" text-anchor="end" fill="#6e7681" font-size="11" xml:space="preserve">agent-gate check</text>
  ${body}
</svg>
`;
}

// --- Write assets ----------------------------------------------------------

fs.mkdirSync(ASSETS, { recursive: true });

const svg = renderSvg(parseAnsi(ansi));
fs.writeFileSync(path.join(ASSETS, 'cli-demo.svg'), svg);

const commentMd = buildBody(result, diff);
fs.writeFileSync(path.join(ASSETS, 'sample-pr-comment.md'), commentMd + '\n');

console.log(`Generated:
  docs/assets/cli-demo.svg          (verdict: ${result.verdict}, ${result.findings.length} findings)
  docs/assets/sample-pr-comment.md`);
