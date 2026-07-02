import { describe, expect, it, vi } from 'vitest';
import { ResourceType } from '../../types';
import { createInitialGameState } from '../state';
import { handleChapter1Action } from './chapter1';

describe('handleChapter1Action', () => {
  it('returns null for unrelated actions', () => {
    const state = createInitialGameState(10_000);
    expect(handleChapter1Action(state, { type: 'RESET_GAME' })).toBeNull();
  });

  it('transitions out of boot during manual crank when thresholds are met', () => {
    const base = createInitialGameState(10_000);
    const state = {
      ...base,
      resources: {
        ...base.resources,
        [ResourceType.OXYGEN]: 19,
      },
      chapter1Stage: 'boot' as const,
      crankClicks: 15,
      lastCrankTime: 0,
    };

    vi.spyOn(Date, 'now').mockReturnValue(20_000);
    const nextState = handleChapter1Action(state, { type: 'MANUAL_CRANK' });

    expect(nextState?.chapter1Stage).toBe('rust');
    expect(nextState?.flags.filtersUnlocked).toBe(true);
    vi.restoreAllMocks();
  });
});
