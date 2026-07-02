import { describe, expect, it, vi } from 'vitest';
import { ResourceType } from '../../types';
import { createInitialGameState } from '../state';
import { handleTick } from './tick';

describe('handleTick', () => {
  it('does not mutate the source state while updating flags and resources', () => {
    const base = createInitialGameState(10_000);
    const state = {
      ...base,
      flags: {
        ...base.flags,
        oxygenCrisis: false,
        lowTempWarning: false,
      },
      resources: {
        ...base.resources,
        [ResourceType.OXYGEN]: 1,
      },
    };

    const nextState = handleTick(state, 11_000);

    expect(state.flags.oxygenCrisis).toBe(false);
    expect(state.flags.lowTempWarning).toBe(false);
    expect(nextState.flags).not.toBe(state.flags);
    expect(nextState.resources).not.toBe(state.resources);
    expect(nextState.flags.lowTempWarning).toBe(true);
  });

  it('applies chapter 2 passive resource generation when chances hit', () => {
    const base = createInitialGameState(10_000);
    const state = {
      ...base,
      phase: 2 as const,
      chapter2: {
        zones: {},
        rov: {
          assembled: false,
          deployed: false,
          currentTarget: null,
          explorationProgress: 0,
          destroyed: false,
          tetherCorrupted: false,
        },
        networkNodes: 0,
        computePower: 0,
        dataPackets: 0,
        ghostDataReceived: false,
        circuits: 0,
        titanium: 0,
        signalAnalyzed: false,
        bZoneRepaired: true,
        cZoneRepaired: false,
        rovFirstDeployment: false,
        tetherTruthRevealed: false,
        icarusLogRead: false,
        icarusAssimilated: false,
        networkAwakened: true,
        chapter2Stage: 'handshake' as const,
      },
    };

    const randomSpy = vi.spyOn(Math, 'random');
    randomSpy
      .mockReturnValueOnce(0.05)
      .mockReturnValueOnce(0.12)
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.15);

    const nextState = handleTick(state, 11_000);

    expect(nextState.chapter2?.circuits).toBe(1);
    expect(nextState.chapter2?.titanium).toBe(2);
    expect(nextState.chapter2?.computePower).toBe(0.5);
    expect(nextState.resources[ResourceType.BIOMASS]).toBe(5);
    randomSpy.mockRestore();
  });
});
