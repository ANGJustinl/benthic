import type {
  ContentCommand,
  EngineState,
  IdleGameViewModel,
  IdlePack,
  SaveEnvelope,
} from '@benthic/idle-core/contracts';

export type MigrationResourceId = 'ore' | 'credits';
export type MigrationBuildingId = 'archive';

export interface MigrationContentState {
  stage: 'legacy' | 'modernized' | 'stabilized';
  migrationSource: 'fresh' | 'legacy-v1' | 'current-v2';
  notes: string[];
}

export type MigrationCommand =
  | ContentCommand
  | { id: 'migration.salvage' }
  | { id: 'migration.stabilize' };

export type MigrationState = EngineState<
  MigrationContentState,
  MigrationResourceId,
  MigrationBuildingId,
  MigrationCommand
>;

export const migrationPackMeta = {
  id: 'save-migration-lab',
  title: 'Save Migration',
  version: '0.2.0',
  description: 'A pack dedicated to portable save envelopes, version bumps, and deterministic migration.',
};

function buildViewModel(state: MigrationState): IdleGameViewModel {
  return {
    shell: {
      title: migrationPackMeta.title,
      subtitle: 'Restore a legacy envelope, inspect the migrated content, then round-trip the modern state back through the same runtime API.',
      theme: state.content.migrationSource === 'legacy-v1' ? 'ledger' : 'workbench',
      badges: ['migrateSave', 'restore', state.content.migrationSource],
    },
    logs: {
      title: 'Migration log',
      entries: [...state.logs].slice(-8).reverse().map((entry) => ({
        id: entry.id,
        text: entry.message,
        tone: entry.level === 'warn' ? 'warning' : 'default',
      })),
    },
    center: [
      {
        kind: 'notice',
        id: 'migration-summary',
        title: 'What changed',
        tone: 'accent',
        lines: [
          'Legacy v1 saves stored credits at the root and had no content namespace.',
          'The v2 pack migrates them into manifest resources and records provenance in content state.',
        ],
      },
      {
        kind: 'actions',
        id: 'migration-actions',
        title: 'Modern state actions',
        actions: [
          {
            id: 'salvage',
            label: 'Salvage archive',
            description: 'Adds ore and credits to the current v2 state.',
            command: {
              kind: 'content',
              id: 'migration.salvage',
            },
          },
          {
            id: 'stabilize',
            label: 'Stabilize ledger',
            description: 'Moves the content stage to a post-migration steady state.',
            disabled: state.content.stage === 'stabilized',
            emphasis: state.content.stage === 'stabilized' ? 'normal' : 'primary',
            command: {
              kind: 'content',
              id: 'migration.stabilize',
            },
          },
        ],
      },
    ],
    right: [
      {
        kind: 'stats',
        id: 'migration-stats',
        title: 'Envelope state',
        rows: [
          {
            kind: 'value',
            id: 'stage',
            label: 'Stage',
            value: state.content.stage,
          },
          {
            kind: 'value',
            id: 'source',
            label: 'Source',
            value: state.content.migrationSource,
          },
          {
            kind: 'value',
            id: 'ore',
            label: 'Ore',
            value: state.resources.ore ?? 0,
          },
          {
            kind: 'value',
            id: 'credits',
            label: 'Credits',
            value: state.resources.credits ?? 0,
          },
        ],
      },
      {
        kind: 'entityList',
        id: 'migration-notes',
        title: 'Content notes',
        items: state.content.notes.map((note, index) => ({
          id: `note-${index}`,
          label: note,
        })),
      },
    ],
  };
}

export const migrationPack: IdlePack<
  MigrationContentState,
  MigrationCommand,
  MigrationResourceId,
  MigrationBuildingId
> = {
  id: migrationPackMeta.id,
  version: 2,
  manifest: {
    resources: {
      ore: { initialAmount: 2, min: 0 },
      credits: { initialAmount: 1, min: 0 },
    },
    buildings: {
      archive: {},
    },
  },
  createInitialContentState() {
    return {
      stage: 'modernized',
      migrationSource: 'fresh',
      notes: ['Fresh v2 state created through createInitialContentState().'],
    };
  },
  migrateSave(envelope: SaveEnvelope<unknown>) {
    const legacy = envelope.snapshot as {
      credits?: number;
      ore?: number;
      chapter?: string;
      seenWelcome?: boolean;
    };

    return {
      resources: {
        ore: legacy.ore ?? 0,
        credits: legacy.credits ?? 0,
      },
      buildings: {
        archive: 0,
      },
      cooldowns: {},
      logs: [
        {
          id: 'migration-log',
          timestamp: 0,
          message: 'Legacy v1 envelope restored through migrateSave().',
          source: 'system',
        },
      ],
      scheduledCommands: [],
      firedAutomationKeys: {},
      lastTick: 0,
      runtime: {
        nextLogSequence: 1,
        nextScheduledSequence: 0,
      },
      content: {
        stage: legacy.chapter === 'legacy-intro' ? 'legacy' : 'modernized',
        migrationSource: 'legacy-v1',
        notes: [
          'Migrated from v1 flat snapshot.',
          legacy.seenWelcome ? 'Legacy welcome flag preserved.' : 'Legacy welcome flag was not set.',
        ],
      },
    };
  },
  handleCommand(state, command, services) {
    if (command.id === 'migration.salvage') {
      services.addResource('ore', 3);
      services.addResource('credits', 2);
      services.appendLog({
        message: 'Current v2 state updated and ready for another save round-trip.',
        source: 'pack',
      });
      return {
        ...state.content,
        migrationSource:
          state.content.migrationSource === 'legacy-v1' ? 'legacy-v1' : 'current-v2',
      };
    }

    if (command.id === 'migration.stabilize') {
      services.appendLog({
        message: 'Post-migration state stabilized without changing the runtime contract.',
        source: 'pack',
      });

      return {
        ...state.content,
        stage: 'stabilized',
        migrationSource:
          state.content.migrationSource === 'legacy-v1' ? 'legacy-v1' : 'current-v2',
        notes: [...state.content.notes, 'Stabilized under pack version 2.'],
      };
    }

    return;
  },
  buildViewModel(state) {
    return buildViewModel(state);
  },
};

export const legacyMigrationEnvelope: SaveEnvelope<unknown> = {
  engineVersion: 0,
  packId: migrationPack.id,
  packVersion: 1,
  snapshot: {
    ore: 9,
    credits: 14,
    chapter: 'legacy-intro',
    seenWelcome: true,
  },
};
