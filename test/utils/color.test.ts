import { describe, it, expect } from 'vitest';
import { colorEnabled, c } from '../../src/utils/color';

describe('colorEnabled', () => {
  it('is off when NO_COLOR is set, even with FORCE_COLOR', () => {
    expect(colorEnabled({ NO_COLOR: '1', FORCE_COLOR: '1' }, { isTTY: true })).toBe(false);
  });

  it('honors FORCE_COLOR=1', () => {
    expect(colorEnabled({ FORCE_COLOR: '1' }, { isTTY: false })).toBe(true);
  });

  it('honors FORCE_COLOR=0 (off) even on a TTY', () => {
    expect(colorEnabled({ FORCE_COLOR: '0' }, { isTTY: true })).toBe(false);
  });

  it('falls back to TTY detection when no env is set', () => {
    expect(colorEnabled({}, { isTTY: true })).toBe(true);
    expect(colorEnabled({}, { isTTY: false })).toBe(false);
  });
});

describe('c helpers', () => {
  it('return strings (color disabled in the non-TTY test environment)', () => {
    expect(c.green('ok')).toBe('ok');
    expect(c.red('bad')).toBe('bad');
    expect(c.bold('hi')).toBe('hi');
  });
});
