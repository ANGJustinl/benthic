import type {
  ContentCommand,
  EngineState,
  IdleGameViewModel,
  IdlePack,
} from '@benthic/idle-core/contracts';

export type AutomationResourceId = 'charge' | 'signal';
export type AutomationBuildingId = 'relay';

export interface AutomationContentState {
  armed: boolean;
  pulsesDelivered: number;
  queueFlushes: number;
}

export type AutomationCommand =
  | ContentCommand
  | { id: 'automation.arm' }
  | { id: 'automation.manual_ping' }
  | { id: 'automation.clear_queue' }
  | { id: 'automation.story.pulse' };

export type AutomationState = EngineState<
  AutomationContentState,
  AutomationResourceId,
  AutomationBuildingId,
  AutomationCommand
>;

export const automationPackMeta = {
  id: 'automation-lab',
  title: 'Automation Queue',
  version: '0.1.0',
  description: 'A scheduler-focused pack that demonstrates timed commands, dedupe, and queue cancellation.',
};

function buildViewModel(state: AutomationState, now: number): IdleGameViewModel {
  const charge = state.resources.charge ?? 0;
  const signal = state.resources.signal ?? 0;

  return {
    shell: {
      title: automationPackMeta.title,
      subtitle: state.content.armed
        ? 'The pack owns the queue. The renderer only dispatches generic commands.'
        : 'Arm the relay, then let idle-core drain the scheduled pulse on its own.',
      theme: state.content.armed ? 'relay' : 'workbench',
      badges: ['syncAutomation', 'onceKey', 'services.cancelScheduledCommands'],
    },
    logs: {
      title: 'Relay log',
      entries: [...state.logs].slice(-8).reverse().map((entry) => ({
        id: entry.id,
        text: entry.message,
        tone: entry.level === 'warn' ? 'warning' : 'default',
      })),
    },
    center: [
      {
        kind: 'notice',
        id: 'automation-summary',
        title: 'Queue contract',
        tone: 'accent',
        lines: [
          'Arming the relay schedules a delayed content command with a onceKey.',
          'The pulse resolves from runtime state alone; no React lifecycle code is involved.',
        ],
      },
      {
        kind: 'actions',
        id: 'automation-actions',
        title: 'Automation controls',
        actions: [
          {
            id: 'arm',
            label: state.content.armed ? 'Relay armed' : 'Arm relay',
            description: 'Schedules a pulse two seconds into the future.',
            disabled: state.content.armed,
            emphasis: state.content.armed ? 'normal' : 'primary',
            command: {
              kind: 'content',
              id: 'automation.arm',
            },
          },
          {
            id: 'manual-ping',
            label: 'Inject manual ping',
            description: 'Adds charge immediately so you can compare synchronous vs scheduled effects.',
            command: {
              kind: 'content',
              id: 'automation.manual_ping',
            },
          },
          {
            id: 'clear-queue',
            label: 'Clear queued pulses',
            description: 'Cancels any pending automation pulse by tag.',
            command: {
              kind: 'content',
              id: 'automation.clear_queue',
            },
          },
        ],
      },
    ],
    right: [
      {
        kind: 'stats',
        id: 'automation-stats',
        title: 'Runtime state',
        rows: [
          {
            kind: 'value',
            id: 'armed',
            label: 'Armed',
            value: state.content.armed ? 'yes' : 'no',
          },
          {
            kind: 'value',
            id: 'charge',
            label: 'Charge',
            value: charge,
          },
          {
            kind: 'value',
            id: 'signal',
            label: 'Signal',
            value: signal,
          },
          {
            kind: 'value',
            id: 'pulses',
            label: 'Delivered pulses',
            value: state.content.pulsesDelivered,
          },
          {
            kind: 'value',
            id: 'queue-size',
            label: 'Queued commands',
            value: state.scheduledCommands.length,
          },
          {
            kind: 'value',
            id: 'clock',
            label: 'Renderer clock',
            value: now,
          },
        ],
      },
      {
        kind: 'entityList',
        id: 'queue',
        title: 'Scheduled entries',
        items:
          state.scheduledCommands.length > 0
            ? state.scheduledCommands.map((scheduled) => ({
                id: scheduled.id,
                label: scheduled.command.id,
                sublabel: `dueAt ${scheduled.dueAt}`,
                status: scheduled.onceKey ?? 'no-onceKey',
              }))
            : [
                {
                  id: 'empty',
                  label: 'Queue empty',
                  sublabel: 'No scheduled commands are pending.',
                },
              ],
      },
    ],
  };
}

export const automationPack: IdlePack<
  AutomationContentState,
  AutomationCommand,
  AutomationResourceId,
  AutomationBuildingId
> = {
  id: automationPackMeta.id,
  version: 1,
  manifest: {
    resources: {
      charge: { initialAmount: 0, min: 0 },
      signal: { initialAmount: 0, min: 0 },
    },
    buildings: {
      relay: {},
    },
  },
  createInitialContentState() {
    return {
      armed: false,
      pulsesDelivered: 0,
      queueFlushes: 0,
    };
  },
  handleCommand(state, command, services) {
    if (command.id === 'automation.arm') {
      if (state.content.armed) {
        return;
      }

      services.appendLog({
        message: 'Relay armed. A delayed pulse has been queued.',
        source: 'pack',
      });

      return {
        ...state.content,
        armed: true,
      };
    }

    if (command.id === 'automation.manual_ping') {
      services.addResource('charge', 1);
      services.appendLog({
        message: 'Manual ping injected directly through CONTENT_COMMAND.',
        source: 'operator',
      });
      return state.content;
    }

    if (command.id === 'automation.clear_queue') {
      const cancelled = services.cancelScheduledCommands({ tag: 'relay-pulse' });
      services.appendLog({
        message: cancelled > 0
          ? `Cancelled ${cancelled} queued pulse(s).`
          : 'Queue was already empty.',
        source: 'operator',
        level: cancelled > 0 ? 'info' : 'warn',
      });
      return {
        ...state.content,
        armed: false,
        queueFlushes: state.content.queueFlushes + 1,
      };
    }

    if (command.id === 'automation.story.pulse') {
      services.addResource('charge', 3);
      services.addResource('signal', 1);
      services.appendLog({
        message: 'Scheduled pulse delivered by the headless runtime.',
        source: 'system',
      });

      return {
        ...state.content,
        armed: false,
        pulsesDelivered: state.content.pulsesDelivered + 1,
      };
    }

    return;
  },
  syncAutomation(state, cause, services) {
    if (state.content.armed && cause.type !== 'scheduled-command') {
      services.scheduleCommand({
        dueAt: services.now + 2_000,
        onceKey: 'relay.pulse',
        tags: ['relay-pulse'],
        command: {
          id: 'automation.story.pulse',
        },
      });
    }
  },
  buildViewModel(state, options) {
    return buildViewModel(state, options.now);
  },
};
