import { describe, expect, it } from 'vitest';
import { BuildingType, ResourceType } from '../types';
import { gameReducer } from './reducer';
import { createInitialGameState } from './state';

describe('gameReducer', () => {
  it('applies pump production and phase-1 oxygen decay on TICK', () => {
    const base = createInitialGameState(10_000);
    const state = {
      ...base,
      resources: {
        ...base.resources,
        [ResourceType.OXYGEN]: 10,
      },
      buildings: {
        ...base.buildings,
        [BuildingType.PUMP]: 1,
      },
    };

    const nextState = gameReducer(state, { type: 'TICK', payload: { now: 11_000 } });

    expect(nextState.lastTick).toBe(11_000);
    expect(nextState.resources[ResourceType.OXYGEN]).toBeCloseTo(10.52, 5);
  });

  it('builds a pump when resources cover the scaled cost', () => {
    const base = createInitialGameState(10_000);
    const state = {
      ...base,
      resources: {
        ...base.resources,
        [ResourceType.SCRAP]: 25,
        [ResourceType.BIOMASS]: 15,
      },
    };

    const nextState = gameReducer(state, { type: 'BUILD', payload: { building: BuildingType.PUMP } });

    expect(nextState.buildings[BuildingType.PUMP]).toBe(1);
    expect(nextState.resources[ResourceType.SCRAP]).toBe(15);
    expect(nextState.resources[ResourceType.BIOMASS]).toBe(10);
  });

  it('leaves state unchanged when build cost cannot be paid', () => {
    const state = createInitialGameState(10_000);
    const nextState = gameReducer(state, { type: 'BUILD', payload: { building: BuildingType.PUMP } });

    expect(nextState).toBe(state);
  });

  it('initializes chapter 2 state through the SET_PHASE helper action', () => {
    const state = createInitialGameState(10_000);
    const nextState = gameReducer(state, { type: 'SET_PHASE', payload: { phase: 2 } });

    expect(nextState.phase).toBe(2);
    expect(nextState.chapter2).toBeDefined();
  });

  it('resets to a fresh initial state', () => {
    const base = createInitialGameState(10_000);
    const state = {
      ...base,
      totalClicks: 99,
      resources: {
        ...base.resources,
        [ResourceType.SCRAP]: 123,
      },
    };

    const before = Date.now();
    const nextState = gameReducer(state, { type: 'RESET_GAME' });
    const after = Date.now();

    expect(nextState.totalClicks).toBe(0);
    expect(nextState.resources[ResourceType.SCRAP]).toBe(0);
    expect(nextState).not.toBe(state);
    expect(nextState.lastTick).toBeGreaterThanOrEqual(before);
    expect(nextState.lastTick).toBeLessThanOrEqual(after);
  });
});
