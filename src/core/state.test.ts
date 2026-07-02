import { describe, expect, it } from 'vitest';

import type { EngineState } from './contracts';
import { cloneEngineState, clonePlainData } from './state';

describe('core/state', () => {
  it('deep-clones plain nested data structures', () => {
    const source = {
      nested: {
        value: 1,
      },
      list: [{ label: 'a' }],
    };

    const cloned = clonePlainData(source);
    cloned.nested.value = 5;
    cloned.list[0]!.label = 'b';

    expect(source).toEqual({
      nested: {
        value: 1,
      },
      list: [{ label: 'a' }],
    });
  });

  it('preserves structured-clone values like Date and Map', () => {
    const now = new Date('2026-07-02T00:00:00.000Z');
    const source = {
      createdAt: now,
      counters: new Map([['alpha', 1]]),
    };

    const cloned = clonePlainData(source);
    cloned.createdAt.setUTCFullYear(2030);
    cloned.counters.set('beta', 2);

    expect(source.createdAt.toISOString()).toBe('2026-07-02T00:00:00.000Z');
    expect(source.counters.has('beta')).toBe(false);
  });

  it('clones full engine snapshots without preserving nested references', () => {
    const snapshot: EngineState<{ nested: { step: number } }, 'ore', 'drill', { id: 'noop' }> = {
      resources: { ore: 3 },
      buildings: { drill: 1 },
      cooldowns: { scan: 500 },
      logs: [
        {
          id: 'log-1',
          timestamp: 10,
          message: 'hello',
        },
      ],
      scheduledCommands: [
        {
          id: 'cmd-1',
          dueAt: 20,
          createdAt: 10,
          command: { id: 'noop' },
        },
      ],
      firedAutomationKeys: { ready: true },
      lastTick: 10,
      runtime: {
        nextLogSequence: 1,
        nextScheduledSequence: 1,
      },
      content: {
        nested: {
          step: 1,
        },
      },
    };

    const cloned = cloneEngineState(snapshot);
    cloned.logs[0]!.message = 'changed';
    cloned.scheduledCommands[0]!.command.id = 'still-noop';
    cloned.content.nested.step = 4;

    expect(snapshot.logs[0]!.message).toBe('hello');
    expect(snapshot.scheduledCommands[0]!.command.id).toBe('noop');
    expect(snapshot.content.nested.step).toBe(1);
  });
});
