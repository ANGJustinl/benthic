import type { ContentCommand } from '@benthic/idle-core/contracts';
import { createIdleRuntime } from '@benthic/idle-core/runtime';
import { describe, expect, it } from 'vitest';
import {
  descriptorPack,
  type DescriptorBuildingId,
  type DescriptorCommand,
  type DescriptorContentState,
  type DescriptorResourceId,
  type DescriptorState,
} from './descriptorPack';

const runtime = createIdleRuntime<
  DescriptorContentState,
  DescriptorCommand,
  DescriptorResourceId,
  DescriptorBuildingId
>(descriptorPack);

function runCommand(state: DescriptorState, now: number, id: DescriptorCommand['id'], payload?: Record<string, unknown>) {
  return runtime.step(
    state,
    {
      type: 'CONTENT_COMMAND',
      command: { id, payload } as ContentCommand,
    },
    { now },
  );
}

describe('descriptorPack', () => {
  it('emits all showcase block families through buildViewModel()', () => {
    const viewModel = runtime.buildViewModel(runtime.createInitialState(0), { now: 0 });
    const kinds = new Set([
      ...viewModel!.center.map((block) => block.kind),
      ...viewModel!.right.map((block) => block.kind),
    ]);

    expect(kinds.has('notice')).toBe(true);
    expect(kinds.has('actions')).toBe(true);
    expect(kinds.has('choices')).toBe(true);
    expect(kinds.has('stats')).toBe(true);
    expect(kinds.has('entityList')).toBe(true);
  });

  it('updates view descriptors when the pack mode changes', () => {
    const next = runCommand(runtime.createInitialState(0), 10, 'descriptor.set_mode', {
      mode: 'fabricate',
    });
    const viewModel = runtime.buildViewModel(next, { now: 10 });

    expect(next.content.mode).toBe('fabricate');
    expect(viewModel?.shell.theme).toBe('signal');
  });
});
