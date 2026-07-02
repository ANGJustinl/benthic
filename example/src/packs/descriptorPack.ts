import type {
  ChoiceView,
  ContentCommand,
  EngineState,
  IdleGameViewModel,
  IdlePack,
} from '@benthic/idle-core/contracts';
import { canAffordCosts, getBuildingCosts } from '@benthic/idle-core/economy';

export type DescriptorResourceId = 'ore' | 'insight';
export type DescriptorBuildingId = 'relay';
export type DescriptorMode = 'survey' | 'fabricate' | 'negotiate';

export interface DescriptorContentState {
  mode: DescriptorMode;
  crewFocus: 'mapping' | 'salvage' | 'diplomacy';
  dronesLaunched: number;
}

export type DescriptorCommand =
  | ContentCommand
  | { id: 'descriptor.collect_insight' }
  | { id: 'descriptor.launch_drone' }
  | { id: 'descriptor.set_mode'; payload?: { mode?: DescriptorMode } }
  | { id: 'descriptor.set_focus'; payload?: { focus?: DescriptorContentState['crewFocus'] } };

export type DescriptorState = EngineState<
  DescriptorContentState,
  DescriptorResourceId,
  DescriptorBuildingId,
  DescriptorCommand
>;

export const descriptorPackMeta = {
  id: 'descriptor-studio',
  title: 'Descriptor Studio',
  version: '0.1.0',
  description: 'A renderer contract showcase for notices, stats, actions, entity lists, and choices.',
};

function createModeChoices(currentMode: DescriptorMode): ChoiceView[] {
  return ([
    ['survey', 'Survey', 'Prioritize map clarity and telemetry.'],
    ['fabricate', 'Fabricate', 'Spend ore on deployable infrastructure.'],
    ['negotiate', 'Negotiate', 'Turn insight into calmer crew directives.'],
  ] as const).map(([mode, label, description]) => ({
    id: `mode:${mode}`,
    label,
    description: currentMode === mode ? `${description} Current mode.` : description,
    command: {
      kind: 'content',
      id: 'descriptor.set_mode',
      args: { mode },
    },
  }));
}

function buildViewModel(state: DescriptorState): IdleGameViewModel {
  const relayCost = getBuildingCosts(
    descriptorPack.manifest,
    'relay',
    state.buildings.relay ?? 0,
  );
  const canBuildRelay = canAffordCosts(state.resources, relayCost);
  const relayCostLabel = Object.entries(relayCost)
    .map(([resourceId, amount]) => `${amount} ${resourceId}`)
    .join(' / ');

  return {
    shell: {
      title: descriptorPackMeta.title,
      subtitle: 'Every block on this screen is just data returned by pack.buildViewModel().',
      theme: state.content.mode === 'fabricate' ? 'signal' : 'workbench',
      badges: ['notice', 'stats', 'actions', 'entityList', 'choices'],
    },
    logs: {
      title: 'Descriptor log',
      entries: [...state.logs].slice(-8).reverse().map((entry) => ({
        id: entry.id,
        text: entry.message,
      })),
    },
    center: [
      {
        kind: 'notice',
        id: 'descriptor-summary',
        title: 'Pack-driven layout',
        tone: 'accent',
        lines: [
          'The renderer reads block kinds and dispatches RenderCommand values.',
          'Mode switches, build costs, and disabled states are computed inside the pack.',
        ],
      },
      {
        kind: 'choices',
        id: 'mode-choices',
        title: 'Narrative posture',
        options: createModeChoices(state.content.mode),
      },
      {
        kind: 'actions',
        id: 'descriptor-actions',
        title: 'Active commands',
        actions: [
          {
            id: 'collect-insight',
            label: 'Collect insight',
            description: 'Adds insight for negotiation-oriented scenes.',
            command: {
              kind: 'content',
              id: 'descriptor.collect_insight',
            },
          },
          {
            id: 'launch-drone',
            label: 'Launch scout drone',
            description: 'Spends ore to expand the entity list.',
            disabled: (state.resources.ore ?? 0) < 2,
            command: {
              kind: 'content',
              id: 'descriptor.launch_drone',
            },
          },
          {
            id: 'build-relay',
            label: 'Build relay',
            description: `Uses ENGINE_BUILD through the renderer contract. Cost ${relayCostLabel}`,
            disabled: !canBuildRelay,
            emphasis: canBuildRelay ? 'primary' : 'normal',
            command: {
              kind: 'engine',
              id: 'engine.build',
              args: {
                buildingId: 'relay',
              },
            },
          },
        ],
      },
    ],
    right: [
      {
        kind: 'stats',
        id: 'descriptor-stats',
        title: 'Render model',
        rows: [
          {
            kind: 'value',
            id: 'mode',
            label: 'Mode',
            value: state.content.mode,
          },
          {
            kind: 'value',
            id: 'focus',
            label: 'Crew focus',
            value: state.content.crewFocus,
          },
          {
            kind: 'value',
            id: 'ore',
            label: 'Ore',
            value: state.resources.ore ?? 0,
          },
          {
            kind: 'value',
            id: 'insight',
            label: 'Insight',
            value: state.resources.insight ?? 0,
          },
          {
            kind: 'value',
            id: 'relays',
            label: 'Relays',
            value: state.buildings.relay ?? 0,
          },
        ],
      },
      {
        kind: 'entityList',
        id: 'descriptor-entities',
        title: 'Scene entities',
        items: [
          {
            id: 'crew',
            label: 'Crew directive',
            sublabel: 'Packs can turn pure content state into renderer-friendly rows.',
            status: state.content.crewFocus,
          },
          {
            id: 'drones',
            label: 'Scout drones launched',
            sublabel: 'Entity lists can mix counters, text, and inline actions.',
            value: `${state.content.dronesLaunched}`,
          },
          {
            id: 'relay',
            label: 'Relay lattice',
            sublabel: `Next build cost: ${relayCostLabel}`,
            value: `${state.buildings.relay ?? 0}`,
            status: canBuildRelay ? 'ready' : 'locked',
          },
        ],
      },
    ],
  };
}

export const descriptorPack: IdlePack<
  DescriptorContentState,
  DescriptorCommand,
  DescriptorResourceId,
  DescriptorBuildingId
> = {
  id: descriptorPackMeta.id,
  version: 1,
  manifest: {
    resources: {
      ore: { initialAmount: 6, min: 0 },
      insight: { initialAmount: 2, min: 0 },
    },
    buildings: {
      relay: {
        baseCost: { ore: 4, insight: 1 },
        costScale: 1.5,
      },
    },
  },
  createInitialContentState() {
    return {
      mode: 'survey',
      crewFocus: 'mapping',
      dronesLaunched: 0,
    };
  },
  handleCommand(state, command, services) {
    if (command.id === 'descriptor.collect_insight') {
      services.addResource('insight', 1);
      services.appendLog({
        message: 'The pack emitted a stat-only update without touching the renderer.',
        source: 'pack',
      });
      return state.content;
    }

    if (command.id === 'descriptor.launch_drone') {
      if ((state.resources.ore ?? 0) < 2) {
        return;
      }

      services.addResource('ore', -2);
      services.appendLog({
        message: 'A new drone was launched through a generic content command.',
        source: 'pack',
      });
      return {
        ...state.content,
        dronesLaunched: state.content.dronesLaunched + 1,
      };
    }

    if (command.id === 'descriptor.set_mode') {
      const mode = (command.payload as { mode?: DescriptorMode } | undefined)?.mode;
      if (!mode) {
        return;
      }

      return {
        ...state.content,
        mode,
        crewFocus:
          mode === 'survey'
            ? 'mapping'
            : mode === 'fabricate'
              ? 'salvage'
              : 'diplomacy',
      };
    }

    if (command.id === 'descriptor.set_focus') {
      const focus = (
        command.payload as { focus?: DescriptorContentState['crewFocus'] } | undefined
      )?.focus;
      if (!focus) {
        return;
      }

      return {
        ...state.content,
        crewFocus: focus,
      };
    }

    return;
  },
  buildViewModel(state) {
    return buildViewModel(state);
  },
};
