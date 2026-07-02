import { describe, expect, it } from 'vitest';

import type { ContentCommand, IdleGameViewModel, IdlePack } from './contracts';
import { createIdleRuntime, createInitialEngineState } from './runtime';

type DemoResourceId = 'ore' | 'power';
type DemoBuildingId = 'drill';
type DemoCommand =
  | { id: 'prime-alert' }
  | { id: 'alert' }
  | { id: 'grant'; payload: { resourceId: DemoResourceId; amount: number } };

interface DemoContent {
  stage: 'idle' | 'ready' | 'alerted';
  alertCount: number;
}

const demoPack: IdlePack<DemoContent, DemoCommand, DemoResourceId, DemoBuildingId> = {
  id: 'demo-pack',
  version: 1,
  manifest: {
    resources: {
      ore: { initialAmount: 20, min: 0 },
      power: { initialAmount: 0, min: 0 },
    },
    buildings: {
      drill: {
        baseCost: { ore: 10 },
        passiveProduction: { ore: 1 },
      },
    },
  },
  createInitialContentState() {
    return {
      stage: 'idle',
      alertCount: 0,
    };
  },
  handleCommand(state, command, services) {
    if (command.id === 'grant') {
      services.addResource(command.payload.resourceId, command.payload.amount);
      return state.content;
    }

    if (command.id === 'prime-alert') {
      return {
        ...state.content,
        stage: 'ready',
      };
    }

    if (command.id === 'alert') {
      services.appendLog({
        message: 'Automation alert fired.',
        source: 'pack',
      });

      return {
        ...state.content,
        stage: 'alerted',
        alertCount: state.content.alertCount + 1,
      };
    }

    return state.content;
  },
  handleTick(state, deltaMs, services) {
    if (deltaMs >= 1_000) {
      services.setCooldown('scan', services.now + 2_000);
    }

    return state.content;
  },
  syncAutomation(state, _cause, services) {
    if (state.content.stage === 'ready') {
      services.scheduleCommand({
        dueAt: services.now + 500,
        onceKey: 'demo.alert',
        command: { id: 'alert' },
      });
    }
  },
  buildViewModel(state, options): IdleGameViewModel {
    return {
      shell: {
        title: 'Demo Pack',
        subtitle: `Stage ${state.content.stage} @ ${options.now}`,
        theme: 'demo',
      },
      logs: {
        title: 'Logs',
        entries: state.logs.map((entry) => ({
          id: entry.id,
          text: entry.message,
        })),
      },
      center: [],
      right: [],
    };
  },
};

describe('core/runtime', () => {
  it('creates headless runtime state without importing app code', () => {
    const state = createInitialEngineState(demoPack, 0);

    expect(state.resources).toEqual({
      ore: 20,
      power: 0,
    });
    expect(state.buildings).toEqual({
      drill: 0,
    });
    expect(state.content).toEqual({
      stage: 'idle',
      alertCount: 0,
    });
  });

  it('handles generic build purchases and passive production', () => {
    const runtime = createIdleRuntime(demoPack);
    const built = runtime.step(runtime.createInitialState(0), { type: 'ENGINE_BUILD', buildingId: 'drill' }, { now: 0 });
    const advanced = runtime.advance(built, { now: 2_000 });

    expect(built.resources.ore).toBe(10);
    expect(built.buildings.drill).toBe(1);
    expect(advanced.resources.ore).toBe(12);
    expect(advanced.cooldowns.scan).toBe(4_000);
  });

  it('resets back to a fresh runtime state', () => {
    const runtime = createIdleRuntime(demoPack);
    const built = runtime.step(runtime.createInitialState(0), { type: 'ENGINE_BUILD', buildingId: 'drill' }, { now: 0 });
    const reset = runtime.step(built, { type: 'ENGINE_RESET' }, { now: 900 });

    expect(reset.resources).toEqual({
      ore: 20,
      power: 0,
    });
    expect(reset.buildings).toEqual({
      drill: 0,
    });
    expect(reset.logs).toEqual([]);
    expect(reset.lastTick).toBe(900);
    expect(reset.content).toEqual({
      stage: 'idle',
      alertCount: 0,
    });
  });

  it('loads snapshots through the public engine action and normalizes manifest keys', () => {
    const runtime = createIdleRuntime(demoPack);
    const loaded = runtime.step(
      runtime.createInitialState(0),
      {
        type: 'ENGINE_LOAD_SNAPSHOT',
        snapshot: {
          resources: { ore: 7 } as Record<DemoResourceId, number>,
          buildings: {} as Record<DemoBuildingId, number>,
          cooldowns: {},
          logs: [],
          scheduledCommands: [],
          firedAutomationKeys: {},
          lastTick: 111,
          runtime: {
            nextLogSequence: 0,
            nextScheduledSequence: 0,
          },
          content: {
            stage: 'ready',
            alertCount: 2,
          },
        },
      },
      { now: 111 },
    );

    expect(loaded.resources).toEqual({
      ore: 7,
      power: 0,
    });
    expect(loaded.buildings).toEqual({
      drill: 0,
    });
    expect(loaded.content).toEqual({
      stage: 'ready',
      alertCount: 2,
    });
  });

  it('drains due scheduled commands and persists fired onceKeys across restore', () => {
    const runtime = createIdleRuntime(demoPack);
    const primed = runtime.step(
      runtime.createInitialState(0),
      { type: 'CONTENT_COMMAND', command: { id: 'prime-alert' } },
      { now: 100 },
    );

    expect(primed.scheduledCommands).toHaveLength(1);
    expect(primed.scheduledCommands[0].onceKey).toBe('demo.alert');

    const restored = runtime.restore(runtime.save(primed));
    const advanced = runtime.advance(restored, { now: 700 });
    const advancedAgain = runtime.advance(advanced, { now: 800 });

    expect(advanced.content).toEqual({
      stage: 'alerted',
      alertCount: 1,
    });
    expect(advanced.logs).toHaveLength(1);
    expect(advanced.firedAutomationKeys).toEqual({
      'demo.alert': true,
    });
    expect(advancedAgain.content.alertCount).toBe(1);
    expect(advancedAgain.scheduledCommands).toEqual([]);
  });

  it('runs due commands scheduled for the current step immediately', () => {
    const immediatePack: IdlePack<
      { fired: number; armed: boolean },
      ContentCommand,
      'ore',
      'drill'
    > = {
      id: 'immediate-pack',
      version: 1,
      manifest: {
        resources: {
          ore: { initialAmount: 0 },
        },
        buildings: {
          drill: {},
        },
      },
      createInitialContentState() {
        return {
          fired: 0,
          armed: false,
        };
      },
      handleCommand(state, command) {
        if (command.id === 'arm') {
          return { ...state.content, armed: true };
        }

        if (command.id === 'fire') {
          return { fired: state.content.fired + 1, armed: false };
        }

        return state.content;
      },
      syncAutomation(state, _cause, services) {
        if (state.content.armed) {
          services.scheduleCommand({
            dueAt: services.now,
            onceKey: 'immediate.fire',
            command: { id: 'fire' },
          });
        }
      },
    };

    const state = createIdleRuntime(immediatePack).step(
      createInitialEngineState(immediatePack, 0),
      { type: 'CONTENT_COMMAND', command: { id: 'arm' } },
      { now: 42 },
    );

    expect(state.content).toEqual({
      fired: 1,
      armed: false,
    });
    expect(state.firedAutomationKeys).toEqual({
      'immediate.fire': true,
    });
  });

  it('builds renderer descriptors through the runtime when the pack provides them', () => {
    const runtime = createIdleRuntime(demoPack);
    const viewModel = runtime.buildViewModel(runtime.createInitialState(0), { now: 321 });

    expect(viewModel?.shell.title).toBe('Demo Pack');
    expect(viewModel?.shell.subtitle).toContain('321');
  });

  it('keeps previous state content isolated from pack-side nested mutation', () => {
    const mutatingPack: IdlePack<
      { nested: { count: number } },
      { id: 'mutate' },
      'ore',
      'drill'
    > = {
      id: 'mutating-pack',
      version: 1,
      manifest: {
        resources: {
          ore: { initialAmount: 0 },
        },
        buildings: {
          drill: {},
        },
      },
      createInitialContentState() {
        return {
          nested: { count: 0 },
        };
      },
      handleCommand(state) {
        state.content.nested.count = 99;
        return state.content;
      },
    };

    const runtime = createIdleRuntime(mutatingPack);
    const initial = runtime.createInitialState(0);
    const next = runtime.step(
      initial,
      { type: 'CONTENT_COMMAND', command: { id: 'mutate' } },
      { now: 1 },
    );

    expect(initial.content.nested.count).toBe(0);
    expect(next.content.nested.count).toBe(99);
  });
});
