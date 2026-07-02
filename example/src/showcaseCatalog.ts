import type { ShowcaseDefinition } from './showcaseTypes';

export const showcaseCatalog: ShowcaseDefinition[] = [
  {
    id: 'benthic-slice',
    kicker: 'Hero Pack',
    title: 'Benthic Slice',
    summary: 'A polished vertical slice that shows how a content pack can own pacing, automation, logs, build costs, and view descriptors without leaking React into the runtime.',
    tags: ['pack-owned descriptors', 'engine.build', 'cooldowns', 'automation'],
    imports: ['@benthic/idle-core/runtime', '@benthic/idle-core/economy', '@benthic/idle-core/contracts'],
  },
  {
    id: 'automation-queue',
    kicker: 'Scheduler',
    title: 'Automation Queue',
    summary: 'A focused scene for timed commands, onceKey dedupe, queue cancellation, and pack-owned automation driven entirely by the headless runtime.',
    tags: ['scheduled commands', 'onceKey', 'cancel queue', 'tick-driven'],
    imports: ['@benthic/idle-core/runtime', '@benthic/idle-core/scheduler', '@benthic/idle-core/contracts'],
  },
  {
    id: 'save-migration',
    kicker: 'Persistence',
    title: 'Save Migration',
    summary: 'A live example that restores a legacy envelope into a modern pack version and surfaces the migrated state through the same runtime API.',
    tags: ['restore', 'migration', 'save envelope', 'versioning'],
    imports: ['@benthic/idle-core/runtime', '@benthic/idle-core/save', '@benthic/idle-core/contracts'],
  },
  {
    id: 'descriptor-studio',
    kicker: 'Renderer API',
    title: 'Descriptor Studio',
    summary: 'A small pack dedicated to the renderer contract: notices, stats, entity lists, choices, build actions, and view-only layout composition.',
    tags: ['choices', 'entity list', 'stats', 'view model'],
    imports: ['@benthic/idle-core/runtime', '@benthic/idle-core/contracts', '@benthic/idle-core/economy'],
  },
];
