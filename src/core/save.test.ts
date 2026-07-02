import { describe, expect, it } from 'vitest';

import type { IdlePack, SaveEnvelope } from './contracts';
import { IDLE_CORE_ENGINE_VERSION } from './contracts';
import { createSaveEnvelope, restoreFromSave } from './save';
import { createInitialEngineState } from './runtime';

type SaveCommand = { id: 'noop' };
type SaveContent = { stage: 'fresh' | 'migrated'; notes: string[] };
type SaveResourceId = 'ore';
type SaveBuildingId = 'drill';

const savePack: IdlePack<SaveContent, SaveCommand, SaveResourceId, SaveBuildingId> = {
  id: 'save-pack',
  version: 2,
  manifest: {
    resources: {
      ore: { initialAmount: 4, min: 0 },
    },
    buildings: {
      drill: { initialCount: 1 },
    },
  },
  createInitialContentState() {
    return {
      stage: 'fresh',
      notes: [],
    };
  },
  migrateSave(envelope) {
    const snapshot = envelope.snapshot as {
      resources?: Record<string, number>;
      buildings?: Record<string, number>;
      content?: { notes?: string[] };
    };

    return {
      resources: { ore: snapshot.resources?.ore ?? 0 },
      buildings: { drill: snapshot.buildings?.drill ?? 0 },
      cooldowns: {},
      logs: [],
      scheduledCommands: [],
      firedAutomationKeys: {},
      lastTick: 0,
      runtime: {
        nextLogSequence: 0,
        nextScheduledSequence: 0,
      },
      content: {
        stage: 'migrated',
        notes: [...(snapshot.content?.notes ?? []), 'migrated'],
      },
    };
  },
};

describe('core/save', () => {
  it('creates a portable save envelope', () => {
    const state = createInitialEngineState(savePack, 0);
    const envelope = createSaveEnvelope(savePack, state);

    expect(envelope).toEqual({
      engineVersion: IDLE_CORE_ENGINE_VERSION,
      packId: 'save-pack',
      packVersion: 2,
      snapshot: state,
    });
  });

  it('clones snapshot content when creating save envelopes', () => {
    const state = createInitialEngineState(savePack, 0);
    const envelope = createSaveEnvelope(savePack, state);

    envelope.snapshot.content.notes.push('mutated-outside');

    expect(state.content.notes).toEqual([]);
    expect(envelope.snapshot.content.notes).toEqual(['mutated-outside']);
  });

  it('restores matching snapshots and normalizes missing manifest keys', () => {
    const restored = restoreFromSave(savePack, {
      engineVersion: IDLE_CORE_ENGINE_VERSION,
      packId: 'save-pack',
      packVersion: 2,
      snapshot: {
        resources: {},
        buildings: {},
        cooldowns: {},
        logs: [],
        scheduledCommands: [],
        firedAutomationKeys: {},
        lastTick: 50,
        runtime: {
          nextLogSequence: 0,
          nextScheduledSequence: 0,
        },
        content: {
          stage: 'fresh',
          notes: [],
        },
      },
    });

    expect(restored.resources).toEqual({ ore: 0 });
    expect(restored.buildings).toEqual({ drill: 0 });
    expect(restored.lastTick).toBe(50);
  });

  it('delegates mismatched versions to pack migration', () => {
    const envelope: SaveEnvelope<unknown> = {
      engineVersion: IDLE_CORE_ENGINE_VERSION - 1,
      packId: 'save-pack',
      packVersion: 1,
      snapshot: {
        resources: { ore: 9 },
        buildings: { drill: 3 },
        content: { notes: ['legacy'] },
      },
    };

    const restored = restoreFromSave(savePack, envelope);

    expect(restored.content).toEqual({
      stage: 'migrated',
      notes: ['legacy', 'migrated'],
    });
    expect(restored.resources.ore).toBe(9);
    expect(restored.buildings.drill).toBe(3);
  });

  it('rejects cross-pack restores without guessing', () => {
    expect(() =>
      restoreFromSave(savePack, {
        engineVersion: IDLE_CORE_ENGINE_VERSION,
        packId: 'other-pack',
        packVersion: 2,
        snapshot: {},
      }),
    ).toThrow('Cannot restore save for pack "other-pack" into "save-pack".');
  });
});
