import type { ReactNode } from 'react';
import type { RenderCommand } from '@benthic/idle-core/contracts';
import { createSaveEnvelope, restoreFromSave } from '@benthic/idle-core/save';
import { splitDueScheduledCommands } from '@benthic/idle-core/scheduler';
import { ExampleShell } from './components/ExampleShell';
import { showcaseCatalog } from './showcaseCatalog';
import type {
  ShowcaseDefinition,
  ShowcaseDetailCard,
  ShowcaseSnapshot,
} from './showcaseTypes';
import { useShowcaseRuntime } from './session';
import { automationPack, automationPackMeta } from './packs/automationPack';
import { benthicPack, benthicPackMeta } from './packs/benthicPack';
import {
  descriptorPack,
  descriptorPackMeta,
} from './packs/descriptorPack';
import {
  legacyMigrationEnvelope,
  migrationPack,
  migrationPackMeta,
} from './packs/migrationPack';

export type ShowcaseId = (typeof showcaseCatalog)[number]['id'];

interface ShowcaseSceneProps {
  catalog: ShowcaseDefinition[];
  activeSceneId: ShowcaseId;
  onSelectScene(id: ShowcaseId): void;
}

function getDefinition(id: ShowcaseId): ShowcaseDefinition {
  const definition = showcaseCatalog.find((entry) => entry.id === id);

  if (!definition) {
    throw new Error(`Unknown showcase scene "${id}".`);
  }

  return definition;
}

function renderShell(
  props: ShowcaseSceneProps,
  detailCards: ShowcaseDetailCard[],
  snapshot: ShowcaseSnapshot,
  dispatch: (command: RenderCommand) => void,
  toolbar?: ReactNode,
) {
  return (
    <ExampleShell
      catalog={props.catalog}
      activeSceneId={props.activeSceneId}
      onSelectScene={props.onSelectScene}
      snapshot={snapshot}
      detailCards={detailCards}
      toolbar={toolbar}
      onDispatch={dispatch}
    />
  );
}

export function BenthicScene(props: ShowcaseSceneProps) {
  const scene = getDefinition('benthic-slice');
  const { snapshot, dispatch } = useShowcaseRuntime({
    scene,
    pack: benthicPack,
    packMeta: benthicPackMeta,
    storageKey: 'idle-core:showcase:benthic',
  });

  const detailCards: ShowcaseDetailCard[] = [
    {
      id: 'hero-brief',
      title: 'What this proves',
      lines: [
        'The pack owns narration, cooldowns, build costs, and unlock chains.',
        'React receives only IdleGameViewModel data plus generic RenderCommand values.',
      ],
    },
    {
      id: 'pack-boundary',
      title: 'Scene boundary',
      lines: [
        'This is intentionally a polished slice, not a full Benthic migration.',
        'Its job is to sell the pack API, not to recreate the whole original game.',
      ],
    },
  ];

  return renderShell(props, detailCards, snapshot, dispatch);
}

export function AutomationScene(props: ShowcaseSceneProps) {
  const scene = getDefinition('automation-queue');
  const { snapshot, dispatch, state } = useShowcaseRuntime({
    scene,
    pack: automationPack,
    packMeta: automationPackMeta,
    storageKey: 'idle-core:showcase:automation',
  });
  const queuePreview = splitDueScheduledCommands(state.scheduledCommands, Date.now());
  const detailCards: ShowcaseDetailCard[] = [
    {
      id: 'queue-preview',
      title: 'Scheduler preview',
      lines: [
        `Due now: ${queuePreview.due.length}`,
        `Pending later: ${queuePreview.pending.length}`,
        `Fired onceKeys: ${Object.keys(state.firedAutomationKeys).length}`,
      ],
    },
    {
      id: 'why-it-matters',
      title: 'Why it matters',
      lines: [
        'The queue is inspectable data, not hidden UI timing.',
        'The same scene proves scheduleCommand(), onceKey dedupe, and cancelScheduledCommands().',
      ],
    },
  ];

  return renderShell(props, detailCards, snapshot, dispatch);
}

export function MigrationScene(props: ShowcaseSceneProps) {
  const scene = getDefinition('save-migration');
  const { snapshot, dispatch, runtime, state, replaceState } = useShowcaseRuntime({
    scene,
    pack: migrationPack,
    packMeta: migrationPackMeta,
    storageKey: 'idle-core:showcase:migration',
    tickRateMs: 0,
  });
  const currentEnvelope = createSaveEnvelope(migrationPack, state);
  const detailCards: ShowcaseDetailCard[] = [
    {
      id: 'legacy-shape',
      title: 'Legacy envelope',
      lines: [
        `engineVersion=${legacyMigrationEnvelope.engineVersion}`,
        `packVersion=${legacyMigrationEnvelope.packVersion}`,
        'Root-level credits and chapter fields are migrated into v2 state.',
      ],
      code: JSON.stringify(legacyMigrationEnvelope, null, 2),
    },
    {
      id: 'current-shape',
      title: 'Current envelope',
      lines: [
        `engineVersion=${currentEnvelope.engineVersion}`,
        `packVersion=${currentEnvelope.packVersion}`,
        'The same save envelope shape works before and after migration.',
      ],
      code: JSON.stringify(currentEnvelope, null, 2),
    },
  ];

  const toolbar = (
    <>
      <button
        type="button"
        className="tool-button"
        onClick={() => replaceState(restoreFromSave(migrationPack, legacyMigrationEnvelope))}
      >
        Load legacy envelope
      </button>
      <button
        type="button"
        className="tool-button"
        onClick={() => replaceState(runtime.restore(currentEnvelope))}
      >
        Round-trip current envelope
      </button>
      <button
        type="button"
        className="tool-button"
        onClick={() => replaceState(runtime.createInitialState(Date.now()))}
      >
        Fresh v2 state
      </button>
    </>
  );

  return renderShell(props, detailCards, snapshot, dispatch, toolbar);
}

export function DescriptorScene(props: ShowcaseSceneProps) {
  const scene = getDefinition('descriptor-studio');
  const { snapshot, dispatch } = useShowcaseRuntime({
    scene,
    pack: descriptorPack,
    packMeta: descriptorPackMeta,
    storageKey: 'idle-core:showcase:descriptor',
  });
  const detailCards: ShowcaseDetailCard[] = [
    {
      id: 'renderer-surface',
      title: 'Renderer surface',
      lines: [
        'This scene intentionally uses every block family the generic renderer knows about.',
        'Choices, entity lists, and build actions all come back as plain descriptor data.',
      ],
    },
    {
      id: 'authoring-note',
      title: 'Pack authoring note',
      lines: [
        'When packs compute labels, costs, and disabled states, React stays dumb and reusable.',
      ],
    },
  ];

  return renderShell(props, detailCards, snapshot, dispatch);
}

export const showcaseScenes: Record<ShowcaseId, (props: ShowcaseSceneProps) => ReactNode> = {
  'benthic-slice': BenthicScene,
  'automation-queue': AutomationScene,
  'save-migration': MigrationScene,
  'descriptor-studio': DescriptorScene,
};
