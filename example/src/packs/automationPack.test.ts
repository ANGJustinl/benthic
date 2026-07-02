import type { ContentCommand } from '@benthic/idle-core/contracts';
import { createIdleRuntime } from '@benthic/idle-core/runtime';
import { describe, expect, it } from 'vitest';
import {
  automationPack,
  type AutomationBuildingId,
  type AutomationCommand,
  type AutomationContentState,
  type AutomationResourceId,
  type AutomationState,
} from './automationPack';

const runtime = createIdleRuntime<
  AutomationContentState,
  AutomationCommand,
  AutomationResourceId,
  AutomationBuildingId
>(automationPack);

function runCommand(state: AutomationState, now: number, id: AutomationCommand['id']) {
  return runtime.step(
    state,
    {
      type: 'CONTENT_COMMAND',
      command: { id } as ContentCommand,
    },
    { now },
  );
}

describe('automationPack', () => {
  it('delivers a scheduled pulse after arming the relay', () => {
    const armed = runCommand(runtime.createInitialState(0), 100, 'automation.arm');
    const advanced = runtime.advance(armed, { now: 2_200 });

    expect(armed.scheduledCommands).toHaveLength(1);
    expect(advanced.resources.charge).toBe(3);
    expect(advanced.resources.signal).toBe(1);
    expect(advanced.content.pulsesDelivered).toBe(1);
  });

  it('cancels queued pulses through pack-owned commands', () => {
    const armed = runCommand(runtime.createInitialState(0), 100, 'automation.arm');
    const cleared = runCommand(armed, 200, 'automation.clear_queue');
    const advanced = runtime.advance(cleared, { now: 2_200 });

    expect(cleared.scheduledCommands).toEqual([]);
    expect(advanced.content.pulsesDelivered).toBe(0);
    expect(advanced.content.queueFlushes).toBe(1);
  });
});
