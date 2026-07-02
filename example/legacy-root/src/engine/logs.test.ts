import { describe, expect, it } from 'vitest';
import { createScopedLogIdGenerator, generateLogId } from './logs';

describe('log id helpers', () => {
  it('creates unscoped ids by default', () => {
    expect(generateLogId(1234)).toBe('1234-1');
  });

  it('creates scoped ids with a stable prefix', () => {
    const generateChapter2LogId = createScopedLogIdGenerator('ch2');
    const first = generateChapter2LogId();
    const second = generateChapter2LogId();

    expect(first.startsWith('ch2-')).toBe(true);
    expect(second.startsWith('ch2-')).toBe(true);
    expect(first).not.toBe(second);
  });
});
