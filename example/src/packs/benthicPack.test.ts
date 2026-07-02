import type { ContentCommand } from '@benthic/idle-core/contracts';
import { createIdleRuntime } from '@benthic/idle-core/runtime';
import { describe, expect, it } from 'vitest';
import {
  benthicPack,
  type BenthicBuildingId,
  type BenthicCommand,
  type BenthicContentState,
  type BenthicResourceId,
  type BenthicState,
} from './benthicPack';

const runtime = createIdleRuntime<
  BenthicContentState,
  BenthicCommand,
  BenthicResourceId,
  BenthicBuildingId
>(benthicPack);

function createRandomSequence(...values: number[]): () => number {
  let index = 0;

  return () => {
    const value = values[index] ?? values[values.length - 1] ?? 0.5;
    index += 1;
    return value;
  };
}

function runCommand(
  state: BenthicState,
  now: number,
  id: BenthicCommand['id'],
  random = createRandomSequence(0.5),
): BenthicState {
  return runtime.step(
    state,
    {
      type: 'CONTENT_COMMAND',
      command: { id } as ContentCommand,
    },
    { now, random },
  );
}

function prepareLitState(): BenthicState {
  let state = runtime.createInitialState(0);
  state = runCommand(state, 1_000, 'benthic.manual_crank', createRandomSequence(0.1, 0.1));
  state = runCommand(state, 2_000, 'benthic.manual_crank', createRandomSequence(0.1, 0.1));
  state = runCommand(state, 2_100, 'benthic.ignite_flare');
  return state;
}

function prepareSonarState(): BenthicState {
  let state = prepareLitState();
  state = runCommand(state, 5_200, 'benthic.scavenge', createRandomSequence(0.1, 0.1));
  state = runCommand(state, 8_300, 'benthic.scavenge', createRandomSequence(0.6, 0.6));
  state = runCommand(state, 10_400, 'benthic.scrub_filters', createRandomSequence(0.9, 0.1));
  state = runCommand(state, 12_500, 'benthic.scrub_filters', createRandomSequence(0.9, 0.1));
  state = runCommand(state, 14_600, 'benthic.feed_furnace', createRandomSequence(0.1, 0.1));
  state = runCommand(state, 17_700, 'benthic.feed_furnace', createRandomSequence(0.1, 0.1));
  state = runCommand(state, 20_800, 'benthic.feed_furnace', createRandomSequence(0.1, 0.1));
  state = runCommand(state, 23_900, 'benthic.feed_furnace', createRandomSequence(0.1, 0.1));
  return state;
}

describe('benthicPack', () => {
  it('seeds boot logs through idle-core automation on initial state', () => {
    const state = runtime.createInitialState(0);

    expect(state.content.stage).toBe('boot');
    expect(state.logs).toHaveLength(2);
    expect(state.logs[0]?.message).toContain('系统启动');
  });

  it('supports manual crank and flare ignition progression', () => {
    let state = runtime.createInitialState(0);

    state = runCommand(state, 1_000, 'benthic.manual_crank', createRandomSequence(0.1, 0.1));
    state = runCommand(state, 2_000, 'benthic.manual_crank', createRandomSequence(0.1, 0.1));
    state = runCommand(state, 2_100, 'benthic.ignite_flare');

    expect(state.content.hasLight).toBe(true);
    expect(state.content.stage).toBe('salvage');
    expect(state.resources.oxygen).toBe(0);
  });

  it('unlocks filters, furnace, and sonar through pack-owned function chain', () => {
    const state = prepareSonarState();

    expect(state.content.filtersUnlocked).toBe(true);
    expect(state.content.furnaceUnlocked).toBe(true);
    expect(state.content.sonarUnlocked).toBe(true);
    expect(state.content.stage).toBe('sonar');
    expect(state.content.power).toBe(60);
  });

  it('reaches diagnostics after three sonar pings', () => {
    let state = prepareSonarState();

    state = runCommand(state, 28_000, 'benthic.sonar_ping');
    state = runCommand(state, 32_100, 'benthic.sonar_ping');
    state = runCommand(state, 36_200, 'benthic.sonar_ping');
    state = runCommand(state, 36_300, 'benthic.full_diagnostics');

    expect(state.content.sonarPings).toBe(3);
    expect(state.content.diagnosticsComplete).toBe(true);
    expect(state.content.stage).toBe('diagnostics');
    expect(state.logs.some((entry) => entry.message.includes('全船诊断开始'))).toBe(true);
  });

  it('builds a renderer-facing view model through the public runtime API', () => {
    const state = runtime.createInitialState(0);
    const viewModel = runtime.buildViewModel(state, { now: 1_000 });

    expect(viewModel?.shell.title).toBe('Benthic');
    expect(viewModel?.center.length).toBeGreaterThan(0);
  });
});
