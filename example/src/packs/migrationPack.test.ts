import { createSaveEnvelope } from '@benthic/idle-core/save';
import { createIdleRuntime } from '@benthic/idle-core/runtime';
import { describe, expect, it } from 'vitest';
import {
  legacyMigrationEnvelope,
  migrationPack,
  type MigrationBuildingId,
  type MigrationCommand,
  type MigrationContentState,
  type MigrationResourceId,
} from './migrationPack';

const runtime = createIdleRuntime<
  MigrationContentState,
  MigrationCommand,
  MigrationResourceId,
  MigrationBuildingId
>(migrationPack);

describe('migrationPack', () => {
  it('restores legacy envelopes through migrateSave()', () => {
    const restored = runtime.restore(legacyMigrationEnvelope);

    expect(restored.resources.credits).toBe(14);
    expect(restored.content.migrationSource).toBe('legacy-v1');
    expect(restored.logs[0]?.message).toContain('Legacy v1 envelope');
  });

  it('round-trips modern saves through the low-level save API', () => {
    const state = runtime.createInitialState(0);
    const envelope = createSaveEnvelope(migrationPack, state);
    const restored = runtime.restore(envelope);

    expect(restored.content.migrationSource).toBe('fresh');
    expect(restored.resources).toEqual(state.resources);
  });
});
