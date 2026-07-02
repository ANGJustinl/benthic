import { describe, expect, it } from 'vitest';

import {
  cancelScheduledCommands,
  enqueueScheduledCommand,
  splitDueScheduledCommands,
} from './scheduler';

describe('core/scheduler', () => {
  it('dedupes onceKey entries against queue and fired state', () => {
    const first = enqueueScheduledCommand(
      [],
      {
        dueAt: 500,
        onceKey: 'demo.once',
        command: { id: 'alert' },
      },
      {
        now: 0,
        nextSequence: 1,
      },
    );

    const duplicate = enqueueScheduledCommand(
      first.queue,
      {
        dueAt: 600,
        onceKey: 'demo.once',
        command: { id: 'alert' },
      },
      {
        now: 100,
        nextSequence: 2,
      },
    );

    const afterFired = enqueueScheduledCommand(
      [],
      {
        dueAt: 700,
        onceKey: 'demo.once',
        command: { id: 'alert' },
      },
      {
        now: 200,
        nextSequence: 3,
        firedAutomationKeys: {
          'demo.once': true,
        },
      },
    );

    expect(first.scheduled?.id).toBe('scheduled-1');
    expect(duplicate.scheduled).toBeNull();
    expect(afterFired.scheduled).toBeNull();
  });

  it('splits due work and cancels by matcher', () => {
    const queue = [
      {
        id: 'scheduled-2',
        createdAt: 0,
        dueAt: 900,
        command: { id: 'beta' },
        tags: ['story'],
      },
      {
        id: 'scheduled-1',
        createdAt: 0,
        dueAt: 400,
        command: { id: 'alpha' },
        onceKey: 'alpha.once',
      },
      {
        id: 'scheduled-3',
        createdAt: 0,
        dueAt: 1_200,
        command: { id: 'alpha' },
        tags: ['cleanup'],
      },
    ];

    const { due, pending } = splitDueScheduledCommands(queue, 1_000);
    const cancelled = cancelScheduledCommands(pending, { commandId: 'alpha' });

    expect(due.map((item) => item.id)).toEqual(['scheduled-1', 'scheduled-2']);
    expect(cancelled).toEqual([]);
  });
});
