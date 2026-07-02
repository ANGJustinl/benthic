import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ResourceType } from '../types';
import { loadGameState, saveGameState } from './persistence';
import { createInitialGameState } from './state';

describe('persistence helpers', () => {
  let originalLocalStorage: Storage;

  beforeEach(() => {
    originalLocalStorage = window.localStorage;
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
      writable: true,
    });
  });

  it('loads the initial state when there is no save', () => {
    vi.mocked(window.localStorage.getItem).mockReturnValue(null);

    const state = loadGameState();

    expect(state.chapter1Stage).toBe('boot');
    expect(state.resources[ResourceType.OXYGEN]).toBe(3.8);
  });

  it('falls back to the initial state for incompatible saves', () => {
    vi.mocked(window.localStorage.getItem).mockReturnValue(JSON.stringify({
      resources: {},
      logs: [],
    }));

    const state = loadGameState();

    expect(state.chapter1Stage).toBe('boot');
    expect(state.logs).toEqual([]);
  });

  it('falls back to the initial state for invalid JSON', () => {
    vi.mocked(window.localStorage.getItem).mockReturnValue('{not-valid-json');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const state = loadGameState();

    expect(state.chapter1Stage).toBe('boot');
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('saves the serialized state through localStorage', () => {
    const state = createInitialGameState(1234);
    saveGameState(state);

    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'benthic_save',
      JSON.stringify(state),
    );
  });

  it('does not throw when storage writes fail', () => {
    const state = createInitialGameState(1234);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(window.localStorage.setItem).mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => saveGameState(state)).not.toThrow();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
