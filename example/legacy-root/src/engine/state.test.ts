import { describe, expect, it } from 'vitest';
import { createInitialGameState } from './state';

describe('createInitialGameState', () => {
  it('creates deterministic timing fields from the provided clock', () => {
    const now = 50_000;
    const state = createInitialGameState(now);

    expect(state.lastTick).toBe(now);
    expect(state.lastCrankTime).toBe(now - 2000);
    expect(state.lastFilterTime).toBe(now - 3000);
    expect(state.lastFurnaceTime).toBe(now - 4000);
    expect(state.lastCollectTime).toBe(now - 6000);
    expect(state.lastSonarTime).toBe(now - 8000);
    expect(state.lastDiagnosticsTime).toBe(now - 10000);
  });

  it('returns a fresh state object on every call', () => {
    const a = createInitialGameState(100);
    const b = createInitialGameState(100);

    expect(a).not.toBe(b);
    expect(a.resources).not.toBe(b.resources);
    expect(a.buildings).not.toBe(b.buildings);
    expect(a.flags).not.toBe(b.flags);
  });
});
